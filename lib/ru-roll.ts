export type UniversityTier = "RU_FREE" | "EXTERNAL_PAID";

export function isValidRUEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@(student\.)?ru\.ac\.bd$/.test(email.trim());
}

// TODO: Confirm the exact six-digit roll format with the RU Law department before launch.
export function isValidRURoll(roll: string): boolean {
  return /^\d{6}$/.test(roll.trim());
}

export function getUniversityTier(email: string): UniversityTier {
  return isValidRUEmail(email) ? "RU_FREE" : "EXTERNAL_PAID";
}
