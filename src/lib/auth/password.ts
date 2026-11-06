import "server-only";
import { hash, verify } from "@node-rs/argon2";

// Argon2id (default @node-rs/argon2) — KNF01.
export const hashPassword = (password: string) => hash(password);

export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false; // hash rusak/tidak dikenal = gagal, bukan error 500
  }
}
