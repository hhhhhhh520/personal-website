/**
 * Chat 领域共享类型。
 *
 * 原本 `Message` 在 stores/novaStore.ts 与 lib/ai.ts 各定义一份、形状不一致
 * （lib/ai 多了 'system' 角色）（ISSUE-008）。统一到此处，两处共用。
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
