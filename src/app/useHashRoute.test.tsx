import { act, renderHook } from '@testing-library/react';
import { useHashRoute } from './useHashRoute';

/** 해시를 바꾸고 브라우저와 같은 이벤트를 발생시킨다. */
function goTo(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
}

describe('useHashRoute', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('treats an empty hash as the home route', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('/');
  });

  it('follows hash changes', () => {
    const { result } = renderHook(() => useHashRoute());

    act(() => goTo('#/game'));

    expect(result.current).toBe('/game');
  });

  it('reads the hash that is already set when mounting', () => {
    window.location.hash = '#/game';

    const { result } = renderHook(() => useHashRoute());

    expect(result.current).toBe('/game');
  });

  it('goes back to home when the hash is cleared', () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => goTo('#/game'));

    act(() => goTo(''));

    expect(result.current).toBe('/');
  });

  it('stops listening after unmount', () => {
    const { result, unmount } = renderHook(() => useHashRoute());
    unmount();

    act(() => goTo('#/game'));

    expect(result.current).toBe('/');
  });
});
