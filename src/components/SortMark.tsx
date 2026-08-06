import type { Category } from '@shared/types';

/**
 * 분리배출 표시.
 *
 * 한국 포장재에 찍힌 삼각 화살표 고리와 그 아래 재질 라벨을 그대로 옮겼다.
 * 장식이 아니라 **유학생이 마트에서 읽어야 하는 기호**여서, 도감 카드·수거함·
 * 스캔 결과에 같은 모양을 반복해 띄운다. 설명하지 않고 눈에 익히려는 것이다.
 *
 * 색은 분류 층만 쓴다. 다만 색만으로 구분하지 않으므로 라벨을 항상 함께 둔다.
 */

/** 삼각형의 무게중심. 화살표 하나를 그려 이 점을 축으로 120도씩 돌린다. */
const PIVOT = '24 27.3';

const TONE_CLASS: Record<Category | 'brand', string> = {
  recyclable: 'sort-mark--recyclable',
  food: 'sort-mark--food',
  general: 'sort-mark--general',
  special: 'sort-mark--special',
  brand: 'sort-mark--brand',
};

export function SortMark({
  tone,
  label,
  size = 'md',
}: {
  tone: Category | 'brand';
  /** 표시 아래에 찍히는 말. 비우면 기호만 보인다. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span className={`sort-mark sort-mark--${size} ${TONE_CLASS[tone]}`}>
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        {[0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle} ${PIVOT})`}>
            <path d="M9.5 33.5 18.5 17.5" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="22.5,10.5 23.4,19.1 14.7,14.2" />
          </g>
        ))}
      </svg>
      {label ? <span className="sort-mark__label">{label}</span> : null}
    </span>
  );
}
