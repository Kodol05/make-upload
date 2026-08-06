import { act, render, screen } from '@testing-library/react';
import { ui } from '@/i18n/strings';
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

  it('renders the K-SORT product name', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'K-SORT' })).toBeInTheDocument();
  });

  it('shows the home route by default', () => {
    render(<App />);
    expect(
      screen.queryByRole('heading', { name: ui.game.title.ko }),
    ).not.toBeInTheDocument();
  });

  it('shows the game route when the hash points at it', () => {
    render(<App />);

    act(() => goTo('#/game'));

    expect(screen.getByRole('heading', { name: ui.game.title.ko })).toBeInTheDocument();
  });

  it('keeps the header and footer on every route', () => {
    render(<App />);
    act(() => goTo('#/game'));

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Make Upload')).toBeInTheDocument();
  });

  it('gives the main content the skip link target', () => {
    render(<App />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });
});
