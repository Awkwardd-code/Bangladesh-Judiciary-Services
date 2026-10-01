import { randomBytes, randomInt } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generateNumericCode(length: number): string {
  if (length < 4 || length > 10) {
    throw new Error("Numeric code length must be between 4 and 10.");
  }

  return Array.from({ length }, () => randomInt(0, 10)).join("");
}

export function generateAlphanumericCode(length: number): string {
  if (length !== 15) {
    throw new Error("Alphanumeric code length must be 15.");
  }

  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}
