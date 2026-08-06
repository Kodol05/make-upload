/**
 * `public/`에 둔 자산의 실제 주소를 만든다.
 *
 * GitHub Pages가 `/make-upload/` 하위에서 서비스하므로 `/images/...` 같은 절대
 * 경로를 그대로 쓰면 운영에서 404가 난다. `shared/catalog.ts`는 앱 기준의 경로를
 * 그대로 담아 두고, 화면에 그릴 때 이 함수로 배포 base를 붙인다.
 */
export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
