export type ProfileGender = "male" | "female";

export function getDefaultAvatarUrl(gender: ProfileGender | null | undefined) {
  if (gender === "female") {
    return "/avatars/female.svg";
  }

  if (gender === "male") {
    return "/avatars/male.svg";
  }

  return "/avatars/default.svg";
}

export function isDefaultAvatarUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  try {
    const pathname = new URL(value, "https://legalpath.invalid").pathname;
    return [
      "/avatars/default.svg",
      "/avatars/male.svg",
      "/avatars/female.svg",
    ].includes(pathname);
  } catch {
    return false;
  }
}
