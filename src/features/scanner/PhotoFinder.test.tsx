import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { ApiError } from '@/lib/api';
import type { ScanResponse } from '@shared/types';
import { PhotoFinder } from './PhotoFinder';

const found: ScanResponse = {
  objects: [
    {
      box: [100, 200, 600, 800],
      itemId: 'clear-pet',
      label: '투명 페트병',
      certainty: 'high',
      reason: '라벨이 없는 투명 병입니다.',
    },
  ],
};

function renderScanner(overrides: Partial<Parameters<typeof PhotoFinder>[0]> = {}) {
  const onOpenItem = vi.fn();
  const onClose = vi.fn();
  render(
    <LocaleProvider>
      <PhotoFinder
        scanImage={async () => found}
        prepareImage={async () => ({ mimeType: 'image/jpeg', data: 'AAAA' })}
        onOpenItem={onOpenItem}
        onClose={onClose}
        {...overrides}
      />
    </LocaleProvider>,
  );
  return { onOpenItem, onClose };
}

/** 사진을 고르는 시늉을 한다. */
async function pickPhoto() {
  const file = new File(['x'], 'trash.jpg', { type: 'image/jpeg' });
  await userEvent.upload(screen.getByLabelText(ui.scanner.choosePhoto.ko), file);
}

describe('PhotoFinder', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  /**
   * 고지는 사진을 고르기 **전에** 보여야 한다. 고른 뒤에 띄우면 이미 늦고,
   * 늘 띄워 두면 읽지 않는다.
   */
  it('shows the privacy notice as soon as it opens', () => {
    renderScanner();
    expect(screen.getByText(ui.scanner.privacyTitle.ko)).toBeInTheDocument();
    expect(screen.getByText(ui.scanner.privacyNotice.ko)).toBeInTheDocument();
  });

  it('closes back to the catalog', async () => {
    const { onClose } = renderScanner();

    await userEvent.click(screen.getByRole('button', { name: ui.common.close.ko }));

    expect(onClose).toHaveBeenCalled();
  });

  // 경로 ① 사진을 올려 AI가 판별한다

  it('draws a box and a matching list entry for what it found', async () => {
    renderScanner();

    await pickPhoto();

    const overlay = await screen.findByTestId('scan-box-0');
    expect(overlay).toHaveStyle({ top: '10%', left: '20%' });

    const result = screen.getByTestId('scan-result');
    expect(within(result).getByText('투명 페트병')).toBeInTheDocument();
    expect(within(result).getByText(ui.scanner.certaintyHigh.ko)).toBeInTheDocument();
  });

  it('opens the catalog entry for a confident result', async () => {
    const { onOpenItem } = renderScanner();
    await pickPhoto();

    const result = await screen.findByTestId('scan-result');
    await userEvent.click(within(result).getByRole('button', { name: /투명 페트병/ }));

    expect(onOpenItem).toHaveBeenCalledWith('clear-pet');
  });

  it('asks the user to confirm when the model is unsure', async () => {
    renderScanner({
      scanImage: async () => ({
        objects: [{ ...found.objects[0], certainty: 'medium' }],
      }),
    });

    await pickPhoto();

    expect(await screen.findByText(ui.scanner.confirmPrompt.ko)).toBeInTheDocument();
  });

  it('asks the user to confirm when it could not identify the object', async () => {
    renderScanner({
      scanImage: async () => ({
        objects: [{ ...found.objects[0], itemId: 'unknown', certainty: 'low' }],
      }),
    });

    await pickPhoto();

    expect(await screen.findByText(ui.scanner.unknownLabel.ko)).toBeInTheDocument();
    expect(screen.getByText(ui.scanner.confirmPrompt.ko)).toBeInTheDocument();
  });

  it('says so when nothing was found', async () => {
    renderScanner({ scanImage: async () => ({ objects: [] }) });

    await pickPhoto();

    expect(await screen.findByText(ui.scanner.noObjects.ko)).toBeInTheDocument();
  });

  it('explains an image that is too large', async () => {
    // 품질을 바닥까지 내려도 한도를 못 맞추면 null이 온다.
    renderScanner({ prepareImage: async () => null });

    await pickPhoto();

    expect(await screen.findByText(ui.scanner.imageTooLarge.ko)).toBeInTheDocument();
  });

  it('points at the catalog when the assistant is unavailable', async () => {
    renderScanner({
      scanImage: async () => {
        throw new ApiError('unavailable');
      },
    });

    await pickPhoto();

    expect(await screen.findByText(ui.error.unavailable.ko)).toBeInTheDocument();
  });

  it('explains a rate limit', async () => {
    renderScanner({
      scanImage: async () => {
        throw new ApiError('rate_limited');
      },
    });

    await pickPhoto();

    expect(await screen.findByText(ui.error.rateLimited.ko)).toBeInTheDocument();
  });

});
