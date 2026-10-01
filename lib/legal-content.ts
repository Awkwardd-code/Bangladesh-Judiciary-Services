export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

// PLACEHOLDER — replace with legal-reviewed copy before launch.
// NOTE: This content is placeholder only and must be reviewed by a qualified
// legal professional before going live.
export const termsSections: LegalSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      "These Terms of Service govern your use of the BJS Prep platform, including its courses, model tests, materials, and related services.",
      "By creating an account or using the platform, you agree to follow these terms and any additional rules shown for a particular service.",
    ],
  },
  {
    heading: "Account Registration",
    paragraphs: [
      "You must provide accurate information when creating an account and keep your login details confidential.",
      "You are responsible for activity under your account and should notify us promptly if you believe your account has been accessed without permission.",
    ],
  },
  {
    heading: "Course Access and Enrollment",
    paragraphs: [
      "Course access begins after successful enrollment and remains subject to the access period and conditions displayed at purchase.",
      "Course materials are provided for your personal study. Sharing account access or redistributing materials is not permitted.",
    ],
  },
  {
    heading: "Payment Terms",
    paragraphs: [
      "Prices and available payment methods are shown at the time of enrollment and may change for future purchases.",
      "A payment is considered complete when it has been confirmed through the selected payment channel and recorded by the platform.",
    ],
  },
  {
    heading: "Intellectual Property",
    paragraphs: [
      "The platform, its original content, course materials, branding, and software are protected by applicable intellectual property laws.",
      "You receive a limited, personal, non-transferable right to use purchased materials for study and may not copy, sell, or publish them.",
    ],
  },
  {
    heading: "User Conduct",
    paragraphs: [
      "Users must use the platform lawfully and respectfully and must not disrupt services, misuse assessments, or attempt to access restricted systems.",
      "We may restrict access when activity threatens platform security, assessment integrity, or the experience of other learners.",
    ],
  },
  {
    heading: "Termination",
    paragraphs: [
      "You may stop using the platform at any time. We may suspend or terminate access when these terms are breached or services must be protected.",
      "Terms that are intended to continue after termination, including intellectual property and conduct obligations, will remain in effect.",
    ],
  },
  {
    heading: "Changes to These Terms",
    paragraphs: [
      "We may update these terms when the platform, services, or legal requirements change.",
      "The revised version will be posted on this page with a new update date. Continued use after publication means you accept the revised terms.",
    ],
  },
];

export const privacySections: LegalSection[] = [
  {
    heading: "Information We Collect",
    paragraphs: [
      "We collect account details, contact information, enrollment records, and information you provide when using courses or assessments.",
      "We may also collect basic technical and usage information needed to operate, secure, and improve the platform.",
    ],
  },
  {
    heading: "How We Use Your Information",
    paragraphs: [
      "Information is used to provide access, process enrollment, communicate service updates, and support your learning experience.",
      "We may use aggregated information to understand platform performance and improve course and assessment design.",
    ],
  },
  {
    heading: "Payment Information",
    paragraphs: [
      "Payment details are handled through the selected payment channel and are used to confirm enrollment and resolve payment questions.",
      "We do not ask you to send payment passwords or security codes through ordinary support messages.",
    ],
  },
  {
    heading: "Cookies and Tracking",
    paragraphs: [
      "The platform may use necessary cookies or similar technologies to maintain sessions, remember preferences, and protect account access.",
      "You can manage cookies through your browser, although disabling necessary cookies may affect some platform functions.",
    ],
  },
  {
    heading: "Data Sharing",
    paragraphs: [
      "We share information only as needed to operate services, process payments, provide support, or comply with lawful requests.",
      "We do not sell personal information to advertisers or unrelated third parties.",
    ],
  },
  {
    heading: "Data Retention",
    paragraphs: [
      "We retain information for as long as needed to provide services, maintain records, resolve disputes, and meet legal obligations.",
      "When information is no longer required, we take reasonable steps to delete it or remove identifying details.",
    ],
  },
  {
    heading: "Your Rights",
    paragraphs: [
      "Depending on applicable law, you may request access to, correction of, or deletion of personal information held about you.",
      "Requests can be made through the contact details published on the platform and may require reasonable account verification.",
    ],
  },
  {
    heading: "Contact Us",
    paragraphs: [
      "Questions about this privacy policy or your information can be sent to the support contact published on the Contact page.",
      "We will review privacy requests and respond within a reasonable period based on the nature of the request.",
    ],
  },
];
