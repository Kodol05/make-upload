import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    /**
     * 기본 5초로는 모자란다.
     *
     * `userEvent`는 입력 사이에 실제 사람만큼 간격을 둔다. 게임을 열 문제 푸는
     * 테스트나 여러 번 묻고 답하는 테스트는 그 간격이 쌓여 몇 초가 걸리는데,
     * 검사를 한꺼번에 돌릴 때는 여러 파일이 동시에 도느라 더 느려진다.
     *
     * 그래서 **틀린 것도 아닌데 실행할 때마다 다른 테스트가 빨간불이 됐다.**
     * 무작위로 깨지는 검사는 아무것도 알려 주지 못하고, 진짜 문제까지 묻는다.
     */
    testTimeout: 20_000,
  },
});
