/** 서버 프로세스 메모리에 두는 간단한 TTL + LRU 캐시 */
export class TtlCache<V> {
  private map = new Map<string, { value: V; expires: number }>();
  constructor(private readonly maxEntries: number) {}

  get(key: string): V | undefined {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    // LRU: 최근 사용 항목을 뒤로
    this.map.delete(key);
    this.map.set(key, hit);
    return hit.value;
  }

  set(key: string, value: V, ttlMs: number) {
    if (ttlMs <= 0) return;
    this.map.delete(key);
    this.map.set(key, { value, expires: Date.now() + ttlMs });
    while (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }

  delete(key: string) {
    this.map.delete(key);
  }

  deleteWhere(predicate: (key: string) => boolean) {
    for (const key of Array.from(this.map.keys())) if (predicate(key)) this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}
