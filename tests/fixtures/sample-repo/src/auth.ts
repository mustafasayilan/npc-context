export interface LoginResult {
  ok: boolean;
  userId?: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  if (!email.includes("@") || password.length < 8) {
    return { ok: false };
  }
  return { ok: true, userId: "user_123" };
}
