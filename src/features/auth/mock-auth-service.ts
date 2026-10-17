import { DEMO_OTP, DEMO_PASSWORD } from "@/lib/data/mock-db";
import { getRepository } from "@/lib/data/repositories";
import type { AuthService } from "./auth-service";

const MAX_ATTEMPTS = 5;

/**
 * Autentikasi data contoh. JANGAN dipakai di produksi: password demo
 * dibandingkan apa adanya dan percobaan dihitung di memori.
 */
export function createMockAuthService(): AuthService {
  const failedAttempts = new Map<string, number>();
  const changedPasswords = new Map<string, string>();
  const repo = getRepository();

  const passwordFor = (userId: string) => changedPasswords.get(userId) ?? DEMO_PASSWORD;

  return {
    async signIn(identifier, password) {
      const key = identifier.trim().toLowerCase();
      if ((failedAttempts.get(key) ?? 0) >= MAX_ATTEMPTS) return { ok: false, error: "too_many_attempts" };

      const user = await repo.findUserByIdentifier(identifier);
      if (!user || password !== passwordFor(user.id)) {
        failedAttempts.set(key, (failedAttempts.get(key) ?? 0) + 1);
        return { ok: false, error: "invalid_credentials" };
      }
      if (!user.isActive) return { ok: false, error: "inactive" };

      failedAttempts.delete(key);
      return { ok: true, user, needsTwoFactor: user.requiresTwoFactor };
    },

    async verifyTwoFactor(_userId, code) {
      return code.trim() === DEMO_OTP ? { ok: true } : { ok: false, error: "invalid_code" };
    },

    async changePassword(userId, current, next) {
      if (current !== passwordFor(userId)) return { ok: false, error: "wrong_password" };
      changedPasswords.set(userId, next);
      return { ok: true };
    },

    async signOut() {},
  };
}
