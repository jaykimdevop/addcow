/**
 * Rate Limiting 설정
 * Upstash Redis를 사용한 요청 제한
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT } from "./constants";
import { createErrorResponse, ERROR_MESSAGES } from "./errors";

/**
 * Redis 클라이언트 초기화
 * 환경변수가 없으면 null 반환 (개발 환경에서 선택적 사용)
 */
function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "Upstash Redis credentials not found. Rate limiting is disabled.",
    );
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

const redis = createRedisClient();

/**
 * Rate Limiter 인스턴스
 */
export const rateLimiters = {
  submissions: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT.SUBMISSIONS.requests,
          RATE_LIMIT.SUBMISSIONS.window,
        ),
        analytics: true,
        prefix: "ratelimit:submissions",
      })
    : null,

  contact: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT.CONTACT.requests,
          RATE_LIMIT.CONTACT.window,
        ),
        analytics: true,
        prefix: "ratelimit:contact",
      })
    : null,

  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT.AUTH.requests,
          RATE_LIMIT.AUTH.window,
        ),
        analytics: true,
        prefix: "ratelimit:auth",
      })
    : null,

  read: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT.READ.requests,
          RATE_LIMIT.READ.window,
        ),
        analytics: true,
        prefix: "ratelimit:read",
      })
    : null,
};

/**
 * IP 주소 추출 헬퍼
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "127.0.0.1";
}

/**
 * Rate Limiting 미들웨어 헬퍼
 */
export async function checkRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters,
): Promise<NextResponse | null> {
  const limiter = rateLimiters[limiterType];

  // Rate limiter가 없으면 (Redis 미설정) 통과
  if (!limiter) {
    return null;
  }

  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(createErrorResponse("RATE_LIMIT_EXCEEDED", 429), {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      },
    });
  }

  return null;
}
