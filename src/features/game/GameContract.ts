import type { CatalogItem, GameResult, Locale } from '@shared/types';

/**
 * 게임과 앱 사이의 계약.
 *
 * 게임은 앱의 나머지를 몰라도 되고, 앱은 게임 내부 규칙을 몰라도 된다.
 * 완료하면 결과를 한 번만 돌려준다.
 */
export interface GameExperienceProps {
  locale: Locale;
  items: CatalogItem[];
  onComplete: (result: GameResult) => void;
}
