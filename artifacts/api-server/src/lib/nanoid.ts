import crypto from "crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nanoid(size = 21): string {
  const bytes = crypto.randomBytes(size);
  let result = "";
  for (let i = 0; i < size; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}
