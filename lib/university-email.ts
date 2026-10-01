export type DetectionConfidence = "high" | "medium" | "low" | "unknown";

type StudentIdPattern = {
  id: string;
  pattern: RegExp;
  captureGroup: number;
  confidence: Exclude<DetectionConfidence, "unknown">;
  requireSingleNumericRun?: boolean;
};

type UniversityDomainRule = {
  domain: string;
  university: string;
  studentIdPatterns: StudentIdPattern[];
};

export type StudentIdDetectionResult = {
  domain: string;
  isValidEmail: boolean;
  isUniversityEmail: boolean;
  university?: string;
  studentId?: string;
  confidence: DetectionConfidence;
  matchedRule?: string;
};

const uniqueEightDigitId: StudentIdPattern = {
  id: "numeric-8-digit",
  pattern: /(?<!\d)(\d{8})(?!\d)/g,
  captureGroup: 1,
  confidence: "high",
  requireSingleNumericRun: true,
};

const numericIdPatterns = [uniqueEightDigitId];

export const recognizedUniversityDomains: UniversityDomainRule[] = [
  {
    domain: "du.ac.bd",
    university: "University of Dhaka",
    studentIdPatterns: numericIdPatterns,
  },
  {
    domain: "buet.ac.bd",
    university: "Bangladesh University of Engineering and Technology",
    studentIdPatterns: numericIdPatterns,
  },
  {
    domain: "ju.ac.bd",
    university: "Jahangirnagar University",
    studentIdPatterns: numericIdPatterns,
  },
  {
    domain: "cu.ac.bd",
    university: "University of Chittagong",
    studentIdPatterns: numericIdPatterns,
  },
  {
    domain: "ru.ac.bd",
    university: "University of Rajshahi",
    studentIdPatterns: numericIdPatterns,
  },
  {
    domain: "ku.ac.bd",
    university: "Khulna University",
    studentIdPatterns: numericIdPatterns,
  },
  {
    domain: "bup.edu.bd",
    university: "Bangladesh University of Professionals",
    studentIdPatterns: numericIdPatterns,
  },
  {
    domain: "bracu.ac.bd",
    university: "BRAC University",
    studentIdPatterns: numericIdPatterns,
  },
];

export function detectUniversityEmail(email: string): StudentIdDetectionResult {
  const normalizedEmail = email.trim().toLowerCase();
  const emailParts = normalizedEmail.split("@");
  const isValidEmail =
    emailParts.length === 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  if (!isValidEmail) {
    return {
      domain: "",
      isValidEmail: false,
      isUniversityEmail: false,
      confidence: "unknown",
    };
  }

  const [localPart, domain] = emailParts;
  const universityRule = recognizedUniversityDomains
    .filter(
      (rule) => domain === rule.domain || domain.endsWith(`.${rule.domain}`),
    )
    .sort((left, right) => right.domain.length - left.domain.length)[0];

  if (!universityRule) {
    return {
      domain,
      isValidEmail: true,
      isUniversityEmail: false,
      confidence: "unknown",
    };
  }

  const numericRuns = localPart.match(/\d+/g) ?? [];
  const candidates = universityRule.studentIdPatterns.flatMap((rule) => {
    const flags = rule.pattern.flags.includes("g")
      ? rule.pattern.flags
      : `${rule.pattern.flags}g`;
    const expression = new RegExp(rule.pattern.source, flags);

    return Array.from(localPart.matchAll(expression), (match) => {
      if (rule.requireSingleNumericRun && numericRuns.length !== 1) {
        return null;
      }

      const studentId = match[rule.captureGroup];
      if (!studentId) {
        return null;
      }

      return {
        studentId,
        matchedRule: rule.id,
        confidence: rule.confidence,
      };
    }).filter((candidate) => candidate !== null);
  });

  const uniqueCandidates = Array.from(
    new Map(candidates.map((candidate) => [candidate.studentId, candidate])).values(),
  );

  if (uniqueCandidates.length !== 1) {
    return {
      domain,
      isValidEmail: true,
      isUniversityEmail: true,
      university: universityRule.university,
      confidence: "unknown",
    };
  }

  const [candidate] = uniqueCandidates;

  return {
    domain,
    isValidEmail: true,
    isUniversityEmail: true,
    university: universityRule.university,
    studentId: candidate.studentId,
    confidence: candidate.confidence,
    matchedRule: candidate.matchedRule,
  };
}
