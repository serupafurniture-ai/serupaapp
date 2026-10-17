import type { Role } from "@/features/roles/roles";
import type { User } from "@/lib/data/types";

export type SignInResult =
  | { ok: true; user: User; needsTwoFactor: boolean }
  | { ok: false; error: "invalid_credentials" | "inactive" | "too_many_attempts" };

export type VerifyResult = { ok: true } | { ok: false; error: "invalid_code" };

export type StoredSession = {
  userId: string;
  activeRole: Role | null;
  /** true setelah 2FA lolos (atau tidak diwajibkan). */
  verified: boolean;
};

/**
 * Kontrak autentikasi. Implementasi Supabase (Fase 1) memakai
 * supabase.auth.signInWithPassword + MFA TOTP untuk Owner.
 */
export interface AuthService {
  signIn(identifier: string, password: string): Promise<SignInResult>;
  verifyTwoFactor(userId: string, code: string): Promise<VerifyResult>;
  changePassword(userId: string, current: string, next: string): Promise<{ ok: true } | { ok: false; error: "wrong_password" }>;
  signOut(): Promise<void>;
}
