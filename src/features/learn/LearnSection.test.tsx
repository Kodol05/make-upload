import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { LanguageSelect } from '@/components/LanguageSelect';
import { ui } from '@/i18n/strings';
import { LearnSection } from './LearnSection';

function renderLearn() {
  return render(
    <LocaleProvider>
      <LanguageSelect />
      <LearnSection />
    </LocaleProvider>,
  );
}

function video() {
  return screen.getByTestId('lesson-video') as HTMLVideoElement;
}

async function switchTo(locale: string) {
  await userEvent.selectOptions(screen.getByLabelText(ui.common.language.ko), locale);
}

describe('LearnSection', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  it('gives the section an accessible heading', () => {
    renderLearn();
    expect(
      screen.getByRole('heading', { name: ui.learn.title.ko, level: 2 }),
    ).toBeInTheDocument();
  });

  it('loads the subtitle track for the current language', () => {
    renderLearn();
    const track = video().querySelector('track');
    expect(track?.getAttribute('src')).toContain('subtitles/ko.vtt');
    expect(track?.getAttribute('srclang')).toBe('ko');
  });

  it('swaps the subtitle track when the language changes', async () => {
    renderLearn();

    await switchTo('vi');

    const track = video().querySelector('track');
    expect(track?.getAttribute('src')).toContain('subtitles/vi.vtt');
    expect(track?.getAttribute('srclang')).toBe('vi');
  });

  it('keeps the same video element and playback position across a language change', async () => {
    renderLearn();
    const before = video();
    before.currentTime = 42;

    await switchTo('vi');

    const after = video();
    // 언어를 바꿨다고 video 노드를 다시 만들면 재생 위치가 처음으로 돌아간다.
    expect(after).toBe(before);
    expect(after.currentTime).toBe(42);
  });

  it('points media at the deployment base path', () => {
    renderLearn();
    const source = video().querySelector('source');
    expect(source?.getAttribute('src')).toBe(
      `${import.meta.env.BASE_URL}media/k-sort-guide.mp4`,
    );
  });

  it('always shows the four principles', () => {
    renderLearn();
    for (const principle of Object.values(ui.learn.principles)) {
      expect(screen.getByText(principle.label.ko)).toBeInTheDocument();
    }
  });

  it('replaces the video with a text summary when it fails to load', () => {
    renderLearn();

    fireEvent.error(video());

    expect(screen.queryByTestId('lesson-video')).not.toBeInTheDocument();
    expect(screen.getByText(ui.learn.videoUnavailable.ko)).toBeInTheDocument();
    // 영상이 없어도 4대 원칙은 그대로 읽힌다.
    expect(screen.getByText(ui.learn.principles.empty.label.ko)).toBeInTheDocument();
  });

  it('drops the poster image when that also fails', () => {
    renderLearn();
    fireEvent.error(video());
    const poster = screen.getByRole('img');

    fireEvent.error(poster);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // 이미지가 하나도 없어도 안내 문구는 남는다.
    expect(screen.getByText(ui.learn.videoUnavailable.ko)).toBeInTheDocument();
  });
});
