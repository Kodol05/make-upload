import { chatResponseSchema, scanResponseSchema } from './schemas.js';

/** Worker가 모델 응답을 걸러 내는 계약이 실제로 막아 주는지 확인한다. */
describe('response schemas', () => {
  it('accepts a well formed chat answer', () => {
    const result = chatResponseSchema.safeParse({
      answer: '내용물을 비우고 라벨을 떼어 배출하세요.',
      matchedItemIds: ['clear-pet'],
      sourceIds: ['me-recyclable'],
      status: 'answered',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an item ID that is not in the catalog', () => {
    const result = chatResponseSchema.safeParse({
      answer: '답변',
      matchedItemIds: ['made-up-item'],
      sourceIds: [],
      status: 'answered',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a status the app does not handle', () => {
    const result = chatResponseSchema.safeParse({
      answer: '답변',
      matchedItemIds: [],
      sourceIds: [],
      status: 'maybe',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a scan result with unknown objects', () => {
    const result = scanResponseSchema.safeParse({
      objects: [
        {
          box: [100, 200, 600, 800],
          itemId: 'unknown',
          label: '알 수 없는 물체',
          certainty: 'low',
          reason: '재질을 확인할 수 없습니다.',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects coordinates outside the 0-1000 range', () => {
    const result = scanResponseSchema.safeParse({
      objects: [
        {
          box: [0, 0, 1200, 500],
          itemId: 'can',
          label: '캔',
          certainty: 'high',
          reason: '금속 재질이 보입니다.',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than five detected objects', () => {
    const one = {
      box: [0, 0, 100, 100],
      itemId: 'can',
      label: '캔',
      certainty: 'high',
      reason: '금속 재질이 보입니다.',
    };
    const result = scanResponseSchema.safeParse({ objects: Array(6).fill(one) });
    expect(result.success).toBe(false);
  });
});
