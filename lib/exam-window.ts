export type WindowCheck = {
  open: boolean;
  reason: "ok" | "not-yet-open" | "closed";
  opensAt?: Date;
  closesAt?: Date;
};

export function checkExamWindow(
  exam: {
    scheduledAt?: Date | null;
    closesAt?: Date | null;
  },
  now: Date = new Date(),
): WindowCheck {
  if (exam.scheduledAt && now < exam.scheduledAt) {
    return {
      open: false,
      reason: "not-yet-open",
      opensAt: exam.scheduledAt,
      closesAt: exam.closesAt ?? undefined,
    };
  }

  if (exam.closesAt && now > exam.closesAt) {
    return {
      open: false,
      reason: "closed",
      opensAt: exam.scheduledAt ?? undefined,
      closesAt: exam.closesAt,
    };
  }

  return {
    open: true,
    reason: "ok",
    opensAt: exam.scheduledAt ?? undefined,
    closesAt: exam.closesAt ?? undefined,
  };
}

// NOTE: missing scheduledAt = always open. Missing closesAt = never closes.
// This is the critical fix for exam availability checks.
