/**
 * 설계 문서가 첫 화면과 푸터에 표시하도록 정한 두 줄.
 * 팀 이름과 영문 표어는 고유명사라 번역하지 않는다.
 */
export function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer__tagline">
        Made for international students at Myongji College
      </p>
      <p className="app-footer__team">Make Upload</p>
    </footer>
  );
}
