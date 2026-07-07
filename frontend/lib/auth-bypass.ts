/**
 * TEMP: Dùng tài khoản test thay cho đăng nhập Azure AD.
 * Tắt bằng cách set NEXT_PUBLIC_BYPASS_AUTH_TEMP=false khi build/deploy.
 */
export const BYPASS_AUTH_TEMP =
  process.env.NEXT_PUBLIC_BYPASS_AUTH_TEMP !== "false";

export const TEST_AUTH_USER = {
  email: "test@pvn.vn",
  name: "Tài khoản test",
  is_admin: false,
} as const;
