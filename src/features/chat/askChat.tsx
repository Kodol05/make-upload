import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ItemId } from '@shared/types';

/** 챗봇에게 넘길 거리. 둘 다 없이 부르면 그냥 열기만 한다. */
export interface ChatAsk {
  /** 어느 품목을 보다가 물었는지. 서버가 그 품목을 아는 채로 답한다. */
  itemId?: ItemId;
  /** 입력란에 미리 넣어 둘 말. 사용자가 그대로 보내거나 이어서 쓴다. */
  question?: string;
}

interface AskChatValue {
  ask: (about: ChatAsk) => void;
  /** 마지막으로 들어온 요청. 새로 부를 때마다 새 객체라 한 번씩만 반응한다. */
  pending: ChatAsk | null;
}

/**
 * 공급자가 없으면 아무 일도 하지 않는다.
 *
 * 도감이나 챗봇을 따로 떼어 화면 테스트를 할 때 공급자까지 감싸게 만들면,
 * 검사하려던 것과 상관없는 껍데기가 테스트마다 늘어난다. 실제로 이어졌는지는
 * `App` 통합 테스트가 본다.
 */
const AskChatContext = createContext<AskChatValue>({ ask: () => undefined, pending: null });

/**
 * 도감·검색에서 챗봇을 부르는 통로.
 *
 * 챗봇은 페이지를 옮겨도 대화가 남도록 라우트 바깥(`AppShell`)에 있고, 부르는
 * 쪽은 라우트 안쪽 깊은 곳에 있다. 사이의 컴포넌트마다 콜백을 물려 내리는 대신
 * 통로를 하나 둔다.
 */
export function AskChatProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<ChatAsk | null>(null);

  // 같은 품목을 다시 눌러도 반응해야 하므로 매번 새 객체를 만든다.
  const ask = useCallback((about: ChatAsk) => setPending({ ...about }), []);
  const value = useMemo(() => ({ ask, pending }), [ask, pending]);

  return <AskChatContext.Provider value={value}>{children}</AskChatContext.Provider>;
}

export function useAskChat(): AskChatValue {
  return useContext(AskChatContext);
}
