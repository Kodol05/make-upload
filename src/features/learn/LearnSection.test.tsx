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

describe('LearnSection 영상이 끝났을 때', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  function renderLesson() {
    render(
      <LocaleProvider>
        <LearnSection />
      </LocaleProvider>,
    );
    return screen.getByTestId('lesson-video');
  }

  it('stays out of the way until the video actually ends', () => {
    renderLesson();
    expect(screen.queryByText(ui.learn.endedTitle.ko)).not.toBeInTheDocument();
  });

  /** 마지막 화면에서 그냥 멈춰 서면 다음에 무엇을 할지 알 수 없다. */
  it('asks what to do next when the video ends', () => {
    const video = renderLesson();

    fireEvent.ended(video);

    expect(screen.getByText(ui.learn.endedTitle.ko)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ui.learn.watchAgain.ko }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: ui.journey.toCatalog.ko }),
    ).toHaveAttribute('href', '#/catalog');
  });

  it('goes away again once something is playing', () => {
    const video = renderLesson();
    fireEvent.ended(video);

    fireEvent.play(video);

    expect(screen.queryByText(ui.learn.endedTitle.ko)).not.toBeInTheDocument();
  });
});

describe('LearnSection 영상이 끝났을 때', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  function renderLesson() {
    render(
      <LocaleProvider>
        <LearnSection />
      </LocaleProvider>,
    );
    const video = screen.getByTestId('lesson-video') as HTMLVideoElement;
    // jsdom은 play를 구현하지 않는다. 몇 번 불렸는지만 보면 된다.
    const play = vi.fn(() => Promise.resolve());
    Object.defineProperty(video, 'play', { value: play, configurable: true });
    return { video, play };
  }

  it('stays out of the way until the video actually ends', () => {
    renderLesson();
    expect(screen.queryByText(ui.learn.endedTitle.ko)).not.toBeInTheDocument();
  });

  it('asks what to do next when the video ends', () => {
    const { video } = renderLesson();

    fireEvent.ended(video);

    expect(screen.getByText(ui.learn.endedTitle.ko)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: ui.journey.toCatalog.ko }),
    ).toHaveAttribute('href', '#/catalog');
  });

  /** 한 번 누르면 한 번만 재생돼야 한다. */
  it('replays exactly once when asked', async () => {
    const { video, play } = renderLesson();
    fireEvent.ended(video);

    await userEvent.click(screen.getByRole('button', { name: ui.learn.watchAgain.ko }));

    expect(play).toHaveBeenCalledTimes(1);
    expect(video.currentTime).toBe(0);
    expect(screen.queryByText(ui.learn.endedTitle.ko)).not.toBeInTheDocument();
  });

  /** 되감는 도중에 오는 신호는 무시한다. 그대로 두면 덮개가 곧바로 다시 뜬다. */
  it('ignores the stray ended signal while rewinding', async () => {
    const { video } = renderLesson();
    fireEvent.ended(video);
    await userEvent.click(screen.getByRole('button', { name: ui.learn.watchAgain.ko }));

    fireEvent.ended(video);

    expect(screen.queryByText(ui.learn.endedTitle.ko)).not.toBeInTheDocument();
  });

  /** 다시 본 영상이 진짜로 끝나면 같은 선택지가 다시 떠야 한다. */
  it('asks again after the replay finishes', async () => {
    const { video, play } = renderLesson();
    fireEvent.ended(video);
    await userEvent.click(screen.getByRole('button', { name: ui.learn.watchAgain.ko }));
    fireEvent.seeked(video);

    fireEvent.ended(video);

    expect(screen.getByText(ui.learn.endedTitle.ko)).toBeInTheDocument();
    expect(play).toHaveBeenCalledTimes(1);
  });
});

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
