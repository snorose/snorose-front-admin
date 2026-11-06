import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom은 레이아웃을 계산하지 않으므로 ProseMirror의 커서 위치 측정 API를 보완합니다.
Range.prototype.getBoundingClientRect ??= () => new DOMRect();
Range.prototype.getClientRects ??= () =>
  Object.assign([], { item: () => null }) as unknown as DOMRectList;
document.elementFromPoint ??= () => null;

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);
