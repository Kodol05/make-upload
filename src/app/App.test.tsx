import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ui } from '@/i18n/strings';
import { locales } from '@shared/types';
import { App } from './App';

/** 해시를 바꾸고 브라우저와 같은 이벤트를 발생시킨다. */
function goTo(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
    window.location.hash = '';
  });

  it('renders the K-SORT product name once the journey starts', () => {
    render(<App />);
    // 소개는 영상 한 장면이라 메뉴를 띄우지 않는다. 이름은 그다음 화면부터 나온다.
    act(() => goTo('#/learn'));
    expect(screen.getByRole('heading', { name: 'K-SORT' })).toBeInTheDocument();
  });

  it('opens on the first step of the journey', () => {
    render(<App />);
    // 첫 페이지는 소개다. 영상 한 편과 한 줄, 그리고 나머지 화면은 아직 없다.
    expect(
      screen.getByRole('heading', { name: ui.home.title.ko, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: ui.game.title.ko }),
    ).not.toBeInTheDocument();
  });

  it('shows the game route when the hash points at it', () => {
    render(<App />);

    act(() => goTo('#/game'));

    expect(screen.getByRole('heading', { name: ui.game.title.ko })).toBeInTheDocument();
  });

  it('keeps the header and footer once the journey starts', () => {
    render(<App />);
    act(() => goTo('#/game'));

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Make Upload')).toBeInTheDocument();
  });

  it('gives the main content the skip link target', () => {
    render(<App />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('never leaks the machine readable placeholder to any locale', async () => {
    const { container } = render(<App />);
    // 언어 선택기의 라벨도 번역 대상이라 locale마다 바뀐다. role로 잡는다.
    const languageSelect = screen.getByRole('combobox');

    for (const locale of locales) {
      await userEvent.selectOptions(languageSelect, locale);
      expect(container.textContent, locale).not.toContain('__TODO__');
    }
  });
});
