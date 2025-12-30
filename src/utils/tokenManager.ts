// 전역 토큰 재발급 상태 관리
export class TokenRefreshManager {
  private static isRefreshing = false;
  private static refreshPromise: Promise<boolean> | null = null;

  public static async refresh(
    refreshFn: () => Promise<boolean>
  ): Promise<boolean> {
    // 이미 재발급 중이면 같은 Promise 반환
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // 재발급 시작
    this.isRefreshing = true;
    this.refreshPromise = refreshFn()
      .then((result) => {
        return result;
      })
      .catch(() => {
        return false;
      })
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  public static isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  public static reset(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}
