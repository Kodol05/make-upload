import { assetUrl } from './assetUrl';

/**
 * 배포 base가 `/make-upload/`이므로 `/images/...` 같은 절대 경로를 그대로 쓰면
 * 운영에서 404가 난다. 테스트 환경의 base는 `/`다.
 */
describe('assetUrl', () => {
  it('prefixes the deployment base', () => {
    expect(assetUrl('/images/items/clear-pet/01.webp')).toBe(
      `${import.meta.env.BASE_URL}images/items/clear-pet/01.webp`,
    );
  });

  it('accepts a path without a leading slash', () => {
    expect(assetUrl('media/k-sort-guide.mp4')).toBe(
      `${import.meta.env.BASE_URL}media/k-sort-guide.mp4`,
    );
  });

  it('never produces a double slash', () => {
    expect(assetUrl('/media/poster.webp')).not.toContain('//');
  });

  it('leaves an absolute URL alone', () => {
    const external = 'https://www.me.go.kr/guide';
    expect(assetUrl(external)).toBe(external);
  });
});
