/**
 * TEMP: Cho phép đăng ký sáng kiến không cần đăng nhập.
 * Tắt bằng cách set NEXT_PUBLIC_BYPASS_AUTH_TEMP=false khi build/deploy.
 */
export const BYPASS_AUTH_TEMP =
  process.env.NEXT_PUBLIC_BYPASS_AUTH_TEMP !== "false";
