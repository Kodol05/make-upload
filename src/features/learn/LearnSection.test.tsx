import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const VTT_SAMPLE = ['WEBVTT', '', '00:00:01.000 --> 00:00:02.000', '안녕', ''].join(
  String.fromCharCode(10),
);

const SRT_SAMPLE = ['1', '00:00:01,000 --> 00:00:02,000', 'Xin chào', ''].join(
  String.fromCharCode(10),
);

/**
 * 자막 파일을 흉내 낸다. 목록에 없는 주소는 404로 답해 다음 확장자를 찾게 한다.
 */
function stubSubtitles(files: Record<string, string>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      const url = String(input);
      const hit = Object.keys(files).find((name) => url.endsWith(name));
      return hit
        ? new Response(files[hit], { status: 200 })
        : new Response('', { status: 404 });
    }),
  );
  let counter = 0;
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: () => `blob:stub/${(counter += 1)}`,
    revokeObjectURL: () => {},
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
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

  it('loads the subtitle track for the current language', async () => {
    stubSubtitles({ 'ko.vtt': VTT_SAMPLE });
    renderLearn();

    await waitFor(() => {
      const track = video().querySelector('track');
      expect(track?.getAttribute('src')).toContain('subtitles/ko.vtt');
      expect(track?.getAttribute('srclang')).toBe('ko');
    });
  });

  /**
   * 자막을 만드는 쪽이 SRT를 주는 경우가 있다. `<track>`은 WebVTT만 읽으므로
   * 받아서 바꾼 뒤 blob 주소로 넘긴다.
   */
  it('converts an SRT subtitle before handing it to the player', async () => {
    stubSubtitles({ 'vi.srt': SRT_SAMPLE });
    renderLearn();
    await switchTo('vi');

    await waitFor(() => {
      const track = video().querySelector('track');
      expect(track?.getAttribute('src')).toMatch(/^blob:/);
      expect(track?.getAttribute('srclang')).toBe('vi');
    });
  });

  /** 자막 파일이 아예 없으면 track을 만들지 않는다. 빈 항목이 남으면 더 헷갈린다. */
  it('leaves the track out when there is no subtitle file', async () => {
    stubSubtitles({});
    renderLearn();

    await waitFor(() => {
      expect(video().querySelector('track')).toBeNull();
    });
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
    // 4대 원칙 그림도 img라서 포스터만 골라낸다.
    const poster = screen.getByRole('img', { name: ui.learn.title.ko });

    fireEvent.error(poster);

    expect(
      screen.queryByRole('img', { name: ui.learn.title.ko }),
    ).not.toBeInTheDocument();
    // 이미지가 하나도 없어도 안내 문구는 남는다.
    expect(screen.getByText(ui.learn.videoUnavailable.ko)).toBeInTheDocument();
  });
});
