/**
 * Riot API 호출 한도 관리.
 * Riot 은 라우팅 값(asia, kr, americas ...)마다 따로 한도를 센다.
 * 한도에 닿으면 바로 쏘지 않고 잠깐 기다렸다 보내며, 너무 오래 기다려야 하면 실패시킨다.
 *
 * RIOT_RATE_LIMITS="20:1,100:120" 형식 (횟수:초). 기본값은 개발용 키 한도.
 * 운영(Production) 키라면 발급받은 한도로 바꿔 주세요. 예) "500:10,30000:600"
 */

interface Window {
  limit: number;
  ms: number;
}

export function parseLimits(raw: string | undefined): Window[] {
  const fallback = [
    { limit: 20, ms: 1000 },
    { limit: 100, ms: 120_000 },
  ];
  if (!raw) return fallback;
  const parsed = raw
    .split(",")
    .map((part) => part.trim().split(":").map(Number))
    .filter(([n, s]) => Number.isFinite(n) && Number.isFinite(s) && n > 0 && s > 0)
    .map(([n, s]) => ({ limit: n, ms: s * 1000 }));
  return parsed.length > 0 ? parsed : fallback;
}

export class RateLimitWaitTooLong extends Error {
  constructor(public readonly waitMs: number) {
    super(`rate limit wait ${waitMs}ms`);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class Bucket {
  private stamps: number[] = [];
  private blockedUntil = 0;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(private readonly windows: Window[]) {}

  private waitTime(now: number): number {
    let wait = Math.max(0, this.blockedUntil - now);
    const longest = Math.max(...this.windows.map((w) => w.ms));
    this.stamps = this.stamps.filter((t) => now - t < longest);
    for (const w of this.windows) {
      const inWindow = this.stamps.filter((t) => now - t < w.ms);
      if (inWindow.length >= w.limit) {
        // 창 안에서 (limit 번째로 최근) 호출이 창 밖으로 나갈 때까지
        const oldestNeeded = inWindow[inWindow.length - w.limit];
        wait = Math.max(wait, oldestNeeded + w.ms - now + 5);
      }
    }
    return wait;
  }

  /** 호출 슬롯 하나를 예약한다. 호출 순서대로 처리된다. */
  acquire(maxWaitMs: number): Promise<void> {
    const run = this.chain.then(async () => {
      for (;;) {
        const now = Date.now();
        const wait = this.waitTime(now);
        if (wait === 0) {
          this.stamps.push(now);
          return;
        }
        if (wait > maxWaitMs) throw new RateLimitWaitTooLong(wait);
        await sleep(wait);
      }
    });
    // 실패해도 다음 대기열은 이어간다
    this.chain = run.catch(() => undefined);
    return run;
  }

  /** 429 응답을 받았을 때 Retry-After 동안 막는다 */
  block(ms: number) {
    this.blockedUntil = Math.max(this.blockedUntil, Date.now() + ms);
  }
}

const buckets = new Map<string, Bucket>();

export function bucketFor(routing: string): Bucket {
  let b = buckets.get(routing);
  if (!b) {
    b = new Bucket(parseLimits(process.env.RIOT_RATE_LIMITS));
    buckets.set(routing, b);
  }
  return b;
}

export function resetRateLimiters() {
  buckets.clear();
}
