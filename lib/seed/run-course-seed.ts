import "server-only";

import { ObjectId } from "mongodb";

import { coursesCol, examQuestionsCol, examsCol } from "@/lib/collections";
import { getDb } from "@/lib/db";
import type { Course, Segment, SubSegment } from "@/lib/types/course";
import type { Exam, ExamQuestion } from "@/lib/types/exam";

const COURSE_SLUG = "bjs-foundation-complete";
const VIDEO_URLS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=9bZkp7q19f0",
  "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
  "https://vimeo.com/76979871",
] as const;
const PDF_URL = "https://res.cloudinary.com/demo/image/upload/sample.pdf";
const IMAGE_URL = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
const ZOOM_URL = "https://zoom.us/j/12345678901";

// NOTE: Paths skipped: none.
// NOTE: Demo URLs are placeholders; replace them before production.

type Subject =
  | "Criminal Law"
  | "CrPC"
  | "Evidence"
  | "CPC"
  | "Constitutional Law"
  | "Legal Reasoning";

type QuestionSeed = {
  questionText: string;
  correctAnswer: string;
  explanation: string;
};

type MonthSeed = {
  title: string;
  description: string;
  examTitle: string;
  subject: Subject;
  subSegments: Array<{
    title: string;
    kind: SubSegment["kind"];
    payload: SubSegment["payload"];
  }>;
};

export type CourseSeedResult = {
  courseId: string;
  segments: number;
  subSegments: number;
  exams: number;
  questions: number;
  skipped: boolean;
};

const MONTHS: MonthSeed[] = [
  {
    title: "Month 1 — Criminal Law Fundamentals",
    description:
      "Introduction to the Penal Code 1860, general principles, and the most tested sections.",
    examTitle: "Month 1 Model Test — Criminal Law",
    subject: "Criminal Law",
    subSegments: [
      {
        title: "Introduction to Criminal Law",
        kind: "lecture",
        payload: { videoUrl: VIDEO_URLS[0], durationMinutes: 45 },
      },
      {
        title: "Penal Code Sections 1-50 Explained",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[1], durationMinutes: 60 },
      },
      {
        title: "Penal Code Summary Notes",
        kind: "note",
        payload: { pdfUrl: PDF_URL, materialType: "slides" },
      },
      {
        title: "Week 1 Live Doubt Session",
        kind: "live",
        payload: { link: ZOOM_URL, durationMinutes: 60 },
      },
    ],
  },
  {
    title: "Month 2 — Code of Criminal Procedure",
    description: "CrPC 1898, arrest, bail, investigation, and trial procedure.",
    examTitle: "Month 2 Model Test — CrPC",
    subject: "CrPC",
    subSegments: [
      {
        title: "Introduction to CrPC",
        kind: "lecture",
        payload: { videoUrl: VIDEO_URLS[2], durationMinutes: 45 },
      },
      {
        title: "Arrest and Bail Explained",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[3], durationMinutes: 55 },
      },
      {
        title: "Investigation Basics",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[4], durationMinutes: 50 },
      },
      {
        title: "CrPC Annotated Notes",
        kind: "note",
        payload: { pdfUrl: PDF_URL, materialType: "slides" },
      },
    ],
  },
  {
    title: "Month 3 — Law of Evidence",
    description:
      "Evidence Act 1872 — relevancy, admissibility, burden of proof, and witnesses.",
    examTitle: "Month 3 Model Test — Evidence",
    subject: "Evidence",
    subSegments: [
      {
        title: "Evidence Act Fundamentals",
        kind: "lecture",
        payload: { videoUrl: VIDEO_URLS[0], durationMinutes: 45 },
      },
      {
        title: "Relevancy and Admissibility",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[1], durationMinutes: 60 },
      },
      {
        title: "Evidence Act Case Digest",
        kind: "note",
        payload: { pdfUrl: PDF_URL, materialType: "slides" },
      },
      {
        title: "Live Q&A on Evidence",
        kind: "live",
        payload: { link: ZOOM_URL, durationMinutes: 60 },
      },
    ],
  },
  {
    title: "Month 4 — Civil Procedure Code",
    description: "CPC 1908 — jurisdiction, pleadings, trial, and execution.",
    examTitle: "Month 4 Model Test — CPC",
    subject: "CPC",
    subSegments: [
      {
        title: "CPC Introduction",
        kind: "lecture",
        payload: { videoUrl: VIDEO_URLS[2], durationMinutes: 45 },
      },
      {
        title: "Jurisdiction and Res Judicata",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[3], durationMinutes: 55 },
      },
      {
        title: "CPC Flowcharts",
        kind: "note",
        payload: { pdfUrl: PDF_URL, materialType: "slides" },
      },
      {
        title: "Civil Procedure Reference Book",
        kind: "material",
        payload: { pdfUrl: PDF_URL, materialType: "book" },
      },
    ],
  },
  {
    title: "Month 5 — Constitutional Law",
    description:
      "Constitution of Bangladesh — fundamental rights, judicial review, and basic structure.",
    examTitle: "Month 5 Model Test — Constitutional Law",
    subject: "Constitutional Law",
    subSegments: [
      {
        title: "Introduction to the Constitution",
        kind: "lecture",
        payload: { videoUrl: VIDEO_URLS[0], durationMinutes: 45 },
      },
      {
        title: "Fundamental Rights Explained",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[1], durationMinutes: 60 },
      },
      {
        title: "Judicial Review and Article 102",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[2], durationMinutes: 55 },
      },
      {
        title: "Constitutional Law Notes",
        kind: "note",
        payload: { pdfUrl: PDF_URL, materialType: "slides" },
      },
    ],
  },
  {
    title: "Month 6 — Legal Reasoning & Revision",
    description:
      "Legal reasoning techniques, case analysis, and full-syllabus revision.",
    examTitle: "Month 6 Model Test — Full Syllabus",
    subject: "Legal Reasoning",
    subSegments: [
      {
        title: "Legal Reasoning Techniques",
        kind: "lecture",
        payload: { videoUrl: VIDEO_URLS[3], durationMinutes: 45 },
      },
      {
        title: "How to Read Case Law",
        kind: "video",
        payload: { videoUrl: VIDEO_URLS[4], durationMinutes: 55 },
      },
      {
        title: "Legal Maxims Cheatsheet",
        kind: "note",
        payload: { pdfUrl: PDF_URL, materialType: "slides" },
      },
      {
        title: "Final Revision Live Class",
        kind: "live",
        payload: { link: ZOOM_URL, durationMinutes: 60 },
      },
    ],
  },
];

const QUESTION_POOL: Record<Subject, QuestionSeed[]> = {
  "Criminal Law": [
    {
      questionText:
        "Which section of the Penal Code defines criminal conspiracy?",
      correctAnswer: "Section 120A",
      explanation:
        "Section 120A of the Penal Code 1860 defines criminal conspiracy.",
    },
    {
      questionText: "Which Penal Code section defines common intention?",
      correctAnswer: "Section 34",
      explanation:
        "Section 34 addresses acts done by several persons in furtherance of common intention.",
    },
    {
      questionText: "Which section defines murder?",
      correctAnswer: "Section 300",
      explanation:
        "Section 300 defines murder; Section 302 prescribes its punishment.",
    },
    {
      questionText: "Which section prescribes punishment for murder?",
      correctAnswer: "Section 302",
      explanation:
        "Section 302 prescribes punishment for murder under the Penal Code 1860.",
    },
    {
      questionText: "Which section defines theft?",
      correctAnswer: "Section 378",
      explanation:
        "Section 378 defines theft as dishonest moving of movable property out of another's possession.",
    },
    {
      questionText: "Which section prescribes punishment for theft?",
      correctAnswer: "Section 379",
      explanation: "Section 379 prescribes punishment for theft.",
    },
    {
      questionText: "Which section defines extortion?",
      correctAnswer: "Section 383",
      explanation:
        "Section 383 defines extortion by intentional fear of injury and dishonest inducement.",
    },
    {
      questionText: "Which section defines robbery?",
      correctAnswer: "Section 390",
      explanation:
        "Section 390 explains when theft or extortion amounts to robbery.",
    },
    {
      questionText: "Which section defines dacoity?",
      correctAnswer: "Section 391",
      explanation:
        "Section 391 defines dacoity as robbery committed or attempted by five or more persons.",
    },
    {
      questionText: "Which section defines criminal breach of trust?",
      correctAnswer: "Section 405",
      explanation: "Section 405 defines criminal breach of trust.",
    },
    {
      questionText:
        "Which section prescribes punishment for criminal breach of trust?",
      correctAnswer: "Section 406",
      explanation:
        "Section 406 provides the general punishment for criminal breach of trust.",
    },
    {
      questionText: "Which section defines cheating?",
      correctAnswer: "Section 415",
      explanation:
        "Section 415 defines cheating through deception and specified dishonest or fraudulent inducement.",
    },
    {
      questionText: "Which section prescribes punishment for cheating?",
      correctAnswer: "Section 417",
      explanation: "Section 417 provides punishment for cheating.",
    },
    {
      questionText:
        "Which section addresses cheating and dishonestly inducing delivery of property?",
      correctAnswer: "Section 420",
      explanation:
        "Section 420 addresses cheating that dishonestly induces delivery of property.",
    },
    {
      questionText: "Which section defines defamation?",
      correctAnswer: "Section 499",
      explanation:
        "Section 499 defines defamation and sets out its exceptions.",
    },
    {
      questionText: "Which section prescribes punishment for defamation?",
      correctAnswer: "Section 500",
      explanation: "Section 500 provides punishment for defamation.",
    },
    {
      questionText: "Which section defines culpable homicide?",
      correctAnswer: "Section 299",
      explanation: "Section 299 defines culpable homicide.",
    },
    {
      questionText: "Which section defines voluntarily causing hurt?",
      correctAnswer: "Section 321",
      explanation: "Section 321 defines voluntarily causing hurt.",
    },
    {
      questionText: "Which section defines grievous hurt?",
      correctAnswer: "Section 320",
      explanation: "Section 320 enumerates the categories of grievous hurt.",
    },
    {
      questionText: "Which section defines wrongful restraint?",
      correctAnswer: "Section 339",
      explanation: "Section 339 defines wrongful restraint.",
    },
    {
      questionText: "Which section defines wrongful confinement?",
      correctAnswer: "Section 340",
      explanation: "Section 340 defines wrongful confinement.",
    },
    {
      questionText: "Which section defines kidnapping from Bangladesh?",
      correctAnswer: "Section 360",
      explanation: "Section 360 defines kidnapping from Bangladesh.",
    },
    {
      questionText:
        "Which section defines kidnapping from lawful guardianship?",
      correctAnswer: "Section 361",
      explanation: "Section 361 defines kidnapping from lawful guardianship.",
    },
    {
      questionText: "Which section defines abduction?",
      correctAnswer: "Section 362",
      explanation: "Section 362 defines abduction by force or deceitful means.",
    },
    {
      questionText: "Which section defines criminal force?",
      correctAnswer: "Section 350",
      explanation: "Section 350 defines criminal force.",
    },
    {
      questionText: "Which section defines assault?",
      correctAnswer: "Section 351",
      explanation: "Section 351 defines assault.",
    },
    {
      questionText: "Which section defines mischief?",
      correctAnswer: "Section 425",
      explanation:
        "Section 425 defines mischief by intent or knowledge of wrongful loss or damage.",
    },
    {
      questionText: "Which section defines criminal trespass?",
      correctAnswer: "Section 441",
      explanation: "Section 441 defines criminal trespass.",
    },
    {
      questionText: "Which section defines house-trespass?",
      correctAnswer: "Section 442",
      explanation: "Section 442 defines house-trespass.",
    },
    {
      questionText: "Which section defines forgery?",
      correctAnswer: "Section 463",
      explanation: "Section 463 defines forgery.",
    },
    {
      questionText: "Which section defines a false document?",
      correctAnswer: "Section 464",
      explanation:
        "Section 464 explains when a document or electronic record is a false document.",
    },
    {
      questionText: "Which section defines criminal intimidation?",
      correctAnswer: "Section 503",
      explanation: "Section 503 defines criminal intimidation.",
    },
    {
      questionText:
        "Which section defines attempt to commit suicide under the traditional Penal Code text?",
      correctAnswer: "Section 309",
      explanation:
        "Section 309 contains the traditional Penal Code provision; check current local amendments.",
    },
    {
      questionText: "Which section defines abetment?",
      correctAnswer: "Section 107",
      explanation: "Section 107 defines abetment of a thing.",
    },
    {
      questionText:
        "Which section addresses punishment for abetment where no express provision exists?",
      correctAnswer: "Section 109",
      explanation:
        "Section 109 provides punishment for abetment where no express provision is made.",
    },
    {
      questionText: "Which section defines an unlawful assembly?",
      correctAnswer: "Section 141",
      explanation:
        "Section 141 defines an unlawful assembly of five or more persons with a common object.",
    },
    {
      questionText:
        "Which section establishes liability of members for an offence committed in prosecution of common object?",
      correctAnswer: "Section 149",
      explanation:
        "Section 149 provides constructive liability for members of an unlawful assembly.",
    },
    {
      questionText: "Which section defines rioting?",
      correctAnswer: "Section 146",
      explanation:
        "Section 146 defines rioting when force or violence is used by an unlawful assembly.",
    },
    {
      questionText: "Which section defines receiving stolen property?",
      correctAnswer: "Section 410",
      explanation: "Section 410 defines stolen property.",
    },
    {
      questionText:
        "Which section criminalizes dishonestly receiving stolen property?",
      correctAnswer: "Section 411",
      explanation:
        "Section 411 punishes dishonestly receiving or retaining stolen property.",
    },
    {
      questionText:
        "Which section defines criminal omission to give information of an offence?",
      correctAnswer: "Section 202",
      explanation:
        "Section 202 addresses intentional omission to give information by a person legally bound to inform.",
    },
    {
      questionText:
        "Which section concerns harbouring an offender who has escaped custody?",
      correctAnswer: "Section 216",
      explanation:
        "Section 216 concerns harbouring or concealing an offender who has escaped or is sought.",
    },
    {
      questionText:
        "Which section addresses public servant disobeying a direction of law with intent to cause injury?",
      correctAnswer: "Section 166",
      explanation:
        "Section 166 addresses a public servant who knowingly disobeys a direction of law with intent to cause injury.",
    },
    {
      questionText: "Which section defines giving false evidence?",
      correctAnswer: "Section 191",
      explanation: "Section 191 defines giving false evidence.",
    },
    {
      questionText: "Which section prescribes punishment for perjury?",
      correctAnswer: "Section 193",
      explanation:
        "Section 193 provides punishment for giving or fabricating false evidence.",
    },
    {
      questionText: "Which section defines public nuisance?",
      correctAnswer: "Section 268",
      explanation: "Section 268 defines public nuisance.",
    },
    {
      questionText:
        "Which section defines an offence affecting public health through negligent conduct?",
      correctAnswer: "Section 269",
      explanation:
        "Section 269 addresses negligent acts likely to spread infection of disease dangerous to life.",
    },
    {
      questionText:
        "Which section defines dishonest misappropriation of property?",
      correctAnswer: "Section 403",
      explanation:
        "Section 403 punishes dishonest misappropriation of property.",
    },
    {
      questionText:
        "Which section addresses criminal breach of trust by a public servant?",
      correctAnswer: "Section 409",
      explanation:
        "Section 409 applies criminal breach of trust to specified public and professional capacities.",
    },
    {
      questionText:
        "Which section makes preparation to commit dacoity punishable?",
      correctAnswer: "Section 399",
      explanation: "Section 399 punishes preparation to commit dacoity.",
    },
  ],
  CrPC: [
    {
      questionText:
        "Within what period must an arrested person be forwarded to a Magistrate under the CrPC?",
      correctAnswer: "24 hours",
      explanation:
        "Section 61 of the CrPC limits detention without a special order to 24 hours, excluding journey time.",
    },
    {
      questionText: "Which section empowers a Magistrate to issue a warrant?",
      correctAnswer: "Section 204",
      explanation:
        "Section 204 addresses issue of process after taking cognizance and finding sufficient ground.",
    },
    {
      questionText: "Which section concerns information in cognizable cases?",
      correctAnswer: "Section 154",
      explanation:
        "Section 154 governs information relating to cognizable offences.",
    },
    {
      questionText:
        "Which section concerns police investigation in a cognizable case?",
      correctAnswer: "Section 156",
      explanation:
        "Section 156 empowers police to investigate cognizable cases.",
    },
    {
      questionText:
        "Which section authorizes a police officer to examine witnesses?",
      correctAnswer: "Section 161",
      explanation:
        "Section 161 empowers police to examine persons acquainted with the facts and circumstances.",
    },
    {
      questionText:
        "Which section concerns statements recorded by a Magistrate during investigation?",
      correctAnswer: "Section 164",
      explanation:
        "Section 164 provides for recording confessions and statements by a Magistrate.",
    },
    {
      questionText:
        "Which section requires completion of investigation and police report?",
      correctAnswer: "Section 173",
      explanation:
        "Section 173 concerns the report of police on completion of investigation.",
    },
    {
      questionText:
        "Which section authorizes arrest without warrant in specified circumstances?",
      correctAnswer: "Section 54",
      explanation:
        "Section 54 lists circumstances in which a police officer may arrest without warrant.",
    },
    {
      questionText: "Which section concerns the form of a summons?",
      correctAnswer: "Section 68",
      explanation: "Section 68 prescribes the form of summons.",
    },
    {
      questionText:
        "Which section governs proclamation for an absconding person?",
      correctAnswer: "Section 87",
      explanation:
        "Section 87 provides for proclamation where a warrant cannot be executed because the person absconds.",
    },
    {
      questionText:
        "Which section allows attachment of property of a proclaimed person?",
      correctAnswer: "Section 88",
      explanation:
        "Section 88 provides for attachment of property of a proclaimed person.",
    },
    {
      questionText: "Which section authorizes a search warrant?",
      correctAnswer: "Section 96",
      explanation:
        "Section 96 specifies circumstances for issuing a search warrant.",
    },
    {
      questionText:
        "Which section deals with the procedure for search of a place?",
      correctAnswer: "Section 103",
      explanation:
        "Section 103 governs search procedure and the presence of respectable witnesses.",
    },
    {
      questionText:
        "Which section provides for security to keep the peace on conviction?",
      correctAnswer: "Section 106",
      explanation:
        "Section 106 empowers a court to require security for keeping the peace upon conviction in specified cases.",
    },
    {
      questionText:
        "Which section empowers an Executive Magistrate to act on an unlawful assembly?",
      correctAnswer: "Section 127",
      explanation:
        "Section 127 empowers an Executive Magistrate or officer to command an unlawful assembly to disperse.",
    },
    {
      questionText:
        "Which section provides for dispersal of an assembly by civil force?",
      correctAnswer: "Section 128",
      explanation:
        "Section 128 provides for dispersal of an assembly by civil force.",
    },
    {
      questionText: "Which section concerns public nuisance abatement?",
      correctAnswer: "Section 133",
      explanation:
        "Section 133 provides for conditional orders to remove public nuisances.",
    },
    {
      questionText:
        "Which section concerns urgent orders in nuisance or apprehended danger cases?",
      correctAnswer: "Section 144",
      explanation:
        "Section 144 empowers a Magistrate to issue orders in urgent cases of nuisance or apprehended danger.",
    },
    {
      questionText:
        "Which section concerns disputes over land likely to cause a breach of peace?",
      correctAnswer: "Section 145",
      explanation:
        "Section 145 provides a preventive procedure for disputes concerning possession of land likely to cause a breach of peace.",
    },
    {
      questionText:
        "Which section concerns maintenance of wives, children, and parents?",
      correctAnswer: "Section 488",
      explanation:
        "Section 488 of the CrPC provides a summary maintenance remedy.",
    },
    {
      questionText:
        "Which section concerns examination of an accused by the court?",
      correctAnswer: "Section 342",
      explanation:
        "Section 342 allows the court to question the accused to explain circumstances appearing in evidence.",
    },
    {
      questionText: "Which section prescribes the contents of a charge?",
      correctAnswer: "Section 221",
      explanation:
        "Section 221 concerns the particulars to be stated in a charge.",
    },
    {
      questionText: "Which section permits alteration or addition to a charge?",
      correctAnswer: "Section 227",
      explanation:
        "Section 227 allows a court to alter or add to a charge before judgment.",
    },
    {
      questionText:
        "Which section concerns separate charges for distinct offences?",
      correctAnswer: "Section 233",
      explanation:
        "Section 233 states the general rule for separate charges and separate trials.",
    },
    {
      questionText:
        "Which section concerns joinder of charges for offences of the same kind?",
      correctAnswer: "Section 234",
      explanation:
        "Section 234 permits limited joinder of offences of the same kind within its statutory conditions.",
    },
    {
      questionText:
        "Which section concerns joinder of persons accused of the same offence?",
      correctAnswer: "Section 239",
      explanation:
        "Section 239 lists circumstances allowing persons to be charged and tried together.",
    },
    {
      questionText: "Which section concerns tender of pardon to an accomplice?",
      correctAnswer: "Section 337",
      explanation:
        "Section 337 provides for tender of pardon to an accomplice in specified cases.",
    },
    {
      questionText:
        "Which section concerns a confession caused by inducement, threat, or promise?",
      correctAnswer: "Section 24 of the Evidence Act",
      explanation:
        "Section 24 of the Evidence Act excludes a confession caused by specified inducement, threat, or promise.",
    },
    {
      questionText:
        "Which section concerns discharge in a warrant case instituted on a police report?",
      correctAnswer: "Section 241A",
      explanation:
        "Section 241A provides for discharge in a warrant case instituted on a police report.",
    },
    {
      questionText:
        "Which section concerns framing a charge in a warrant case instituted on a police report?",
      correctAnswer: "Section 242",
      explanation:
        "Section 242 concerns framing a charge where the court finds a ground for presuming commission of an offence.",
    },
    {
      questionText:
        "Which section concerns trial of warrant cases by Magistrates?",
      correctAnswer: "Sections 238-250",
      explanation:
        "Sections 238-250 set out the procedure for warrant cases tried by Magistrates.",
    },
    {
      questionText:
        "Which section concerns trial of summons cases by Magistrates?",
      correctAnswer: "Sections 251-259",
      explanation:
        "Sections 251-259 set out the procedure for summons cases tried by Magistrates.",
    },
    {
      questionText: "Which section concerns summary trials?",
      correctAnswer: "Section 260",
      explanation:
        "Section 260 identifies cases that specified Magistrates may try summarily.",
    },
    {
      questionText: "Which section concerns the judgment of a criminal court?",
      correctAnswer: "Section 366",
      explanation:
        "Section 366 addresses the language and contents of a judgment.",
    },
    {
      questionText:
        "Which section requires a judgment to be pronounced in open court?",
      correctAnswer: "Section 366",
      explanation:
        "Section 366 requires judgment to be pronounced in open court.",
    },
    {
      questionText:
        "Which section provides a reference to the High Court Division?",
      correctAnswer: "Section 432",
      explanation:
        "Section 432 provides for reference of a question to the High Court Division.",
    },
    {
      questionText:
        "Which section concerns the High Court Division's power to revise?",
      correctAnswer: "Section 439",
      explanation:
        "Section 439 concerns the revisional powers of the High Court Division.",
    },
    {
      questionText: "Which section concerns appeal from an order of acquittal?",
      correctAnswer: "Section 417",
      explanation:
        "Section 417 concerns appeals from orders of acquittal, subject to its terms.",
    },
    {
      questionText: "Which section concerns appeals from convictions?",
      correctAnswer: "Section 408",
      explanation:
        "Section 408 identifies appeals from convictions by specified Sessions Judges.",
    },
    {
      questionText:
        "Which section concerns the inherent powers of the High Court Division?",
      correctAnswer: "Section 561A",
      explanation:
        "Section 561A preserves the High Court Division's inherent powers to prevent abuse of process and secure justice.",
    },
    {
      questionText: "Which section concerns bail in non-bailable offences?",
      correctAnswer: "Section 497",
      explanation: "Section 497 governs bail in non-bailable offences.",
    },
    {
      questionText: "Which section concerns bail in bailable offences?",
      correctAnswer: "Section 496",
      explanation:
        "Section 496 provides for release on bail in bailable offences.",
    },
    {
      questionText:
        "Which section concerns anticipatory action for a person apprehending arrest?",
      correctAnswer: "Section 498",
      explanation:
        "Section 498 empowers the High Court Division or Court of Session to direct admission to bail.",
    },
    {
      questionText:
        "Which section concerns remand to police custody during investigation?",
      correctAnswer: "Section 167",
      explanation:
        "Section 167 governs remand where an investigation cannot be completed within 24 hours.",
    },
    {
      questionText: "Which section concerns the place of inquiry or trial?",
      correctAnswer: "Section 177",
      explanation:
        "Section 177 states the ordinary venue rule: inquiry and trial are generally held where the offence was committed.",
    },
    {
      questionText:
        "Which section concerns offences committed outside the ordinary local jurisdiction?",
      correctAnswer: "Sections 179-189",
      explanation:
        "Sections 179-189 provide venue rules for specified circumstances and offences.",
    },
    {
      questionText: "Which section concerns withdrawal from prosecution?",
      correctAnswer: "Section 494",
      explanation:
        "Section 494 permits withdrawal from prosecution with the court's consent.",
    },
    {
      questionText: "Which section concerns compounding of offences?",
      correctAnswer: "Section 345",
      explanation:
        "Section 345 lists offences that may be compounded and the persons competent to compound them.",
    },
    {
      questionText:
        "Which section concerns the procedure when a bond is forfeited?",
      correctAnswer: "Section 514",
      explanation:
        "Section 514 of the CrPC concerns the procedure on proof of forfeiture of a bond.",
    },
    {
      questionText:
        "Which section concerns recording evidence in the presence of the accused?",
      correctAnswer: "Section 353",
      explanation:
        "Section 353 generally requires evidence to be taken in the presence of the accused or their pleader.",
    },
  ],
  Evidence: [
    {
      questionText: "Which section defines facts in issue?",
      correctAnswer: "Section 3",
      explanation: "Section 3 of the Evidence Act 1872 defines facts in issue.",
    },
    {
      questionText: "Which section defines relevant facts?",
      correctAnswer: "Section 3",
      explanation:
        "Section 3 defines relevant facts by reference to the provisions of the Act.",
    },
    {
      questionText:
        "Which section makes facts forming part of the same transaction relevant?",
      correctAnswer: "Section 6",
      explanation:
        "Section 6 covers facts forming part of the same transaction, commonly called res gestae.",
    },
    {
      questionText: "Which section concerns motive, preparation, and conduct?",
      correctAnswer: "Section 8",
      explanation:
        "Section 8 makes motive, preparation, and relevant conduct material.",
    },
    {
      questionText:
        "Which section concerns facts necessary to explain or introduce relevant facts?",
      correctAnswer: "Section 9",
      explanation:
        "Section 9 addresses facts necessary to explain or introduce relevant facts.",
    },
    {
      questionText: "Which section concerns admissions?",
      correctAnswer: "Section 17",
      explanation: "Section 17 defines admissions.",
    },
    {
      questionText: "Which section concerns admissions by a party's agent?",
      correctAnswer: "Section 18",
      explanation:
        "Section 18 identifies admissions by parties and persons whose statements may bind them.",
    },
    {
      questionText:
        "Which section concerns proof of admissions against their maker?",
      correctAnswer: "Section 21",
      explanation:
        "Section 21 generally makes admissions relevant and provable against their maker, subject to exceptions.",
    },
    {
      questionText:
        "Which section excludes certain admissions in civil cases made on an express condition?",
      correctAnswer: "Section 23",
      explanation:
        "Section 23 concerns admissions made on an express condition that they are not to be given in evidence.",
    },
    {
      questionText:
        "Which section concerns confessions caused by inducement, threat, or promise?",
      correctAnswer: "Section 24",
      explanation:
        "Section 24 excludes a confession caused by an inducement, threat, or promise from a person in authority.",
    },
    {
      questionText:
        "Which section concerns confession made to a police officer?",
      correctAnswer: "Section 25",
      explanation:
        "Section 25 generally bars proof of a confession made to a police officer against an accused.",
    },
    {
      questionText:
        "Which section concerns confession made while in police custody?",
      correctAnswer: "Section 26",
      explanation:
        "Section 26 generally excludes a confession made in police custody unless made in the immediate presence of a Magistrate.",
    },
    {
      questionText:
        "Which section provides the discovery exception to the confession rule?",
      correctAnswer: "Section 27",
      explanation:
        "Section 27 permits proof of so much information as distinctly relates to a fact discovered in consequence of information from an accused in custody.",
    },
    {
      questionText: "Which section concerns admissions not conclusive proof?",
      correctAnswer: "Section 31",
      explanation:
        "Section 31 states that admissions are not conclusive proof, though they may operate as estoppels.",
    },
    {
      questionText:
        "Which section makes statements of a deceased person relevant in specified cases?",
      correctAnswer: "Section 32",
      explanation:
        "Section 32 lists cases in which statements by unavailable persons are relevant, including dying declarations.",
    },
    {
      questionText: "Which section concerns entries in books of account?",
      correctAnswer: "Section 34",
      explanation:
        "Section 34 makes regularly kept account entries relevant, but alone insufficient to charge a person with liability.",
    },
    {
      questionText:
        "Which section concerns judgments relevant to bar a second suit or trial?",
      correctAnswer: "Section 40",
      explanation:
        "Section 40 makes prior judgments relevant when their existence would bar a second suit or trial.",
    },
    {
      questionText: "Which section concerns judgments in rem?",
      correctAnswer: "Section 41",
      explanation:
        "Section 41 addresses final judgments in probate, matrimonial, admiralty, and insolvency jurisdiction.",
    },
    {
      questionText:
        "Which section concerns judgments relating to public matters?",
      correctAnswer: "Section 42",
      explanation:
        "Section 42 addresses judgments relating to matters of a public nature.",
    },
    {
      questionText:
        "Which section concerns judgments other than those in Sections 40-42?",
      correctAnswer: "Section 43",
      explanation:
        "Section 43 states when judgments other than those in Sections 40-42 are relevant.",
    },
    {
      questionText: "Which section concerns opinions of experts?",
      correctAnswer: "Section 45",
      explanation:
        "Section 45 makes expert opinions relevant on specified technical matters.",
    },
    {
      questionText:
        "Which section concerns the opinion of a person acquainted with handwriting?",
      correctAnswer: "Section 47",
      explanation:
        "Section 47 makes relevant the opinion of a person acquainted with the handwriting of the person concerned.",
    },
    {
      questionText: "Which section concerns the grounds of an expert opinion?",
      correctAnswer: "Section 51",
      explanation:
        "Section 51 makes relevant the grounds on which an opinion is based.",
    },
    {
      questionText: "Which section concerns character in civil cases?",
      correctAnswer: "Section 52",
      explanation:
        "Section 52 generally makes character to prove conduct imputed in civil cases irrelevant.",
    },
    {
      questionText: "Which section concerns character in criminal cases?",
      correctAnswer: "Section 53",
      explanation:
        "Section 53 makes an accused person's good character relevant in criminal proceedings.",
    },
    {
      questionText: "Which section concerns facts that need not be proved?",
      correctAnswer: "Section 56",
      explanation:
        "Section 56 provides that facts of which the court takes judicial notice need not be proved.",
    },
    {
      questionText: "Which section concerns facts judicially noticed?",
      correctAnswer: "Section 57",
      explanation:
        "Section 57 lists matters of which courts must take judicial notice.",
    },
    {
      questionText: "Which section concerns oral evidence?",
      correctAnswer: "Section 59",
      explanation:
        "Section 59 provides that all facts, except contents of documents, may be proved by oral evidence.",
    },
    {
      questionText: "Which section requires oral evidence to be direct?",
      correctAnswer: "Section 60",
      explanation: "Section 60 requires oral evidence to be direct.",
    },
    {
      questionText:
        "Which section concerns proof of contents of documents by primary evidence?",
      correctAnswer: "Section 62",
      explanation:
        "Section 62 defines primary evidence as the document itself produced for inspection of the court.",
    },
    {
      questionText: "Which section defines secondary evidence?",
      correctAnswer: "Section 63",
      explanation: "Section 63 defines the forms of secondary evidence.",
    },
    {
      questionText:
        "Which section concerns cases in which secondary evidence may be given?",
      correctAnswer: "Section 65",
      explanation:
        "Section 65 specifies circumstances in which secondary evidence may be given.",
    },
    {
      questionText:
        "Which section concerns proof of signature and handwriting?",
      correctAnswer: "Section 67",
      explanation:
        "Section 67 requires proof that a signature or handwriting is that of the person alleged.",
    },
    {
      questionText:
        "Which section concerns proof of execution of attested documents?",
      correctAnswer: "Section 68",
      explanation:
        "Section 68 governs proof of execution of documents required by law to be attested.",
    },
    {
      questionText:
        "Which section concerns admission of execution by a party to an attested document?",
      correctAnswer: "Section 70",
      explanation:
        "Section 70 addresses proof where execution is admitted by a party to an attested document.",
    },
    {
      questionText:
        "Which section concerns comparison of a disputed signature or writing?",
      correctAnswer: "Section 73",
      explanation:
        "Section 73 permits comparison by the court and provides for obtaining writing for comparison.",
    },
    {
      questionText: "Which section states the general rule on burden of proof?",
      correctAnswer: "Section 101",
      explanation:
        "Section 101 places the burden on the person who asks the court to give judgment based on asserted facts.",
    },
    {
      questionText:
        "Which section places the burden on the person who would fail if no evidence were given?",
      correctAnswer: "Section 102",
      explanation: "Section 102 explains on whom the burden of proof lies.",
    },
    {
      questionText:
        "Which section concerns the burden of proving a particular fact?",
      correctAnswer: "Section 103",
      explanation:
        "Section 103 places the burden of proving a particular fact on the person who asks the court to believe it.",
    },
    {
      questionText:
        "Which section concerns the burden of proving an exception?",
      correctAnswer: "Section 105",
      explanation:
        "Section 105 places the burden of proving circumstances bringing a case within an exception on the accused.",
    },
    {
      questionText:
        "Which section concerns facts especially within a person's knowledge?",
      correctAnswer: "Section 106",
      explanation:
        "Section 106 places the burden of proving a fact especially within a person's knowledge on that person.",
    },
    {
      questionText: "Which section concerns estoppel?",
      correctAnswer: "Section 115",
      explanation: "Section 115 defines estoppel.",
    },
    {
      questionText: "Which section concerns competency of witnesses?",
      correctAnswer: "Section 118",
      explanation:
        "Section 118 provides that all persons are competent unless unable to understand questions or give rational answers.",
    },
    {
      questionText:
        "Which section concerns privileged communications during marriage?",
      correctAnswer: "Section 122",
      explanation:
        "Section 122 governs communications made during marriage and their protection.",
    },
    {
      questionText: "Which section concerns evidence of an accomplice?",
      correctAnswer: "Section 133",
      explanation:
        "Section 133 provides that an accomplice is a competent witness against an accused.",
    },
    {
      questionText:
        "Which section concerns the number of witnesses required to prove a fact?",
      correctAnswer: "Section 134",
      explanation:
        "Section 134 provides that no particular number of witnesses is required to prove a fact.",
    },
    {
      questionText:
        "Which section concerns examination-in-chief, cross-examination, and re-examination?",
      correctAnswer: "Section 137",
      explanation:
        "Section 137 defines examination-in-chief, cross-examination, and re-examination.",
    },
    {
      questionText: "Which section concerns the order of examinations?",
      correctAnswer: "Section 138",
      explanation:
        "Section 138 provides the order and scope of witness examinations.",
    },
    {
      questionText: "Which section concerns leading questions?",
      correctAnswer: "Section 141",
      explanation: "Section 141 defines leading questions.",
    },
    {
      questionText: "Which section permits questions to test veracity?",
      correctAnswer: "Section 146",
      explanation:
        "Section 146 permits specified questions in cross-examination, including questions to test veracity.",
    },
  ],
  CPC: [
    {
      questionText:
        "Which section provides that civil courts have jurisdiction to try all civil suits unless barred?",
      correctAnswer: "Section 9",
      explanation:
        "Section 9 of the CPC gives civil courts jurisdiction over suits of a civil nature unless barred.",
    },
    {
      questionText: "Which section concerns res judicata?",
      correctAnswer: "Section 11",
      explanation: "Section 11 embodies the doctrine of res judicata.",
    },
    {
      questionText:
        "Which section concerns stay of a subsequently instituted suit?",
      correctAnswer: "Section 10",
      explanation:
        "Section 10 addresses stay of trial where the matter is already pending in a previously instituted suit.",
    },
    {
      questionText:
        "Which section concerns bar of a suit to set aside a decree on an objection as to place of suing?",
      correctAnswer: "Section 21",
      explanation:
        "Section 21 regulates objections to jurisdiction as to place of suing.",
    },
    {
      questionText: "Which section concerns institution of suits?",
      correctAnswer: "Section 26",
      explanation:
        "Section 26 provides that every suit is instituted by presentation of a plaint or in another prescribed manner.",
    },
    {
      questionText:
        "Which section concerns place of suing where subject-matter is situated?",
      correctAnswer: "Section 16",
      explanation:
        "Section 16 generally governs suits concerning immovable property and the court within whose local limits it is situated.",
    },
    {
      questionText:
        "Which section concerns place of suing where defendants reside or cause of action arises?",
      correctAnswer: "Section 20",
      explanation:
        "Section 20 provides venue rules based on defendant residence or where cause of action arises.",
    },
    {
      questionText:
        "Which section concerns transfer of a suit by the High Court Division?",
      correctAnswer: "Section 24",
      explanation:
        "Section 24 concerns general powers of transfer and withdrawal by specified courts.",
    },
    {
      questionText: "Which section concerns the inherent powers of the court?",
      correctAnswer: "Section 151",
      explanation:
        "Section 151 preserves inherent powers to make orders necessary for the ends of justice or prevent abuse of process.",
    },
    {
      questionText: "Which section concerns judgment and decree?",
      correctAnswer: "Section 33",
      explanation:
        "Section 33 provides for pronouncement of judgment and drawing up of a decree.",
    },
    {
      questionText:
        "Which section concerns interest on a decree for payment of money?",
      correctAnswer: "Section 34",
      explanation: "Section 34 concerns interest on a money decree.",
    },
    {
      questionText: "Which section concerns costs?",
      correctAnswer: "Section 35",
      explanation:
        "Section 35 provides for costs at the discretion of the court, subject to law.",
    },
    {
      questionText: "Which section concerns execution of decrees?",
      correctAnswer: "Section 38",
      explanation:
        "Section 38 identifies courts by which a decree may be executed.",
    },
    {
      questionText:
        "Which section concerns questions to be determined by the executing court?",
      correctAnswer: "Section 47",
      explanation:
        "Section 47 assigns questions relating to execution, discharge, or satisfaction to the executing court.",
    },
    {
      questionText:
        "Which section concerns transfer of a decree for execution?",
      correctAnswer: "Section 39",
      explanation:
        "Section 39 authorizes transfer of a decree for execution to another competent court.",
    },
    {
      questionText: "Which section concerns arrest and detention in execution?",
      correctAnswer: "Section 55",
      explanation:
        "Section 55 concerns arrest and detention in execution, subject to statutory safeguards.",
    },
    {
      questionText:
        "Which section concerns attachment of property in execution?",
      correctAnswer: "Section 60",
      explanation:
        "Section 60 identifies property liable to attachment and sale in execution, with listed exemptions.",
    },
    {
      questionText: "Which section concerns rateable distribution of assets?",
      correctAnswer: "Section 73",
      explanation:
        "Section 73 provides for rateable distribution in specified execution circumstances.",
    },
    {
      questionText: "Which section concerns appeals from original decrees?",
      correctAnswer: "Section 96",
      explanation:
        "Section 96 provides for appeals from original decrees, subject to statutory limits.",
    },
    {
      questionText:
        "Which section concerns appeals from appellate decrees on substantial questions of law?",
      correctAnswer: "Section 100",
      explanation:
        "Section 100 governs second appeals on substantial questions of law.",
    },
    {
      questionText: "Which section concerns appeals from orders?",
      correctAnswer: "Section 104",
      explanation: "Section 104 identifies orders from which appeals lie.",
    },
    {
      questionText: "Which section concerns review of judgment?",
      correctAnswer: "Section 114",
      explanation:
        "Section 114 provides for review, subject to the conditions and procedure in the CPC.",
    },
    {
      questionText: "Which section concerns revision?",
      correctAnswer: "Section 115",
      explanation:
        "Section 115 provides revisional jurisdiction in specified cases.",
    },
    {
      questionText:
        "Which section concerns reference to the High Court Division?",
      correctAnswer: "Section 113",
      explanation:
        "Section 113 provides for reference of a question to the High Court Division.",
    },
    {
      questionText: "Which Order contains general rules for pleadings?",
      correctAnswer: "Order VI",
      explanation:
        "Order VI of the CPC contains general rules concerning pleadings.",
    },
    {
      questionText: "Which Order concerns the plaint?",
      correctAnswer: "Order VII",
      explanation: "Order VII sets out rules relating to a plaint.",
    },
    {
      questionText: "Which Order concerns written statements?",
      correctAnswer: "Order VIII",
      explanation:
        "Order VIII governs written statements, set-off, and counterclaim.",
    },
    {
      questionText:
        "Which Order concerns appearance and consequences of non-appearance?",
      correctAnswer: "Order IX",
      explanation:
        "Order IX addresses appearance of parties and consequences of non-appearance.",
    },
    {
      questionText: "Which Order concerns discovery and inspection?",
      correctAnswer: "Order XI",
      explanation: "Order XI provides for discovery and inspection.",
    },
    {
      questionText: "Which Order concerns admissions?",
      correctAnswer: "Order XII",
      explanation: "Order XII deals with admissions.",
    },
    {
      questionText:
        "Which Order concerns production, impounding, and return of documents?",
      correctAnswer: "Order XIII",
      explanation:
        "Order XIII addresses production, impounding, and return of documents.",
    },
    {
      questionText:
        "Which Order concerns settlement of issues and determination of suit?",
      correctAnswer: "Order XIV",
      explanation:
        "Order XIV concerns settlement of issues and determination of suits on issues of law or fact.",
    },
    {
      questionText:
        "Which Order concerns disposal of a suit at the first hearing?",
      correctAnswer: "Order XV",
      explanation:
        "Order XV sets out circumstances for disposal at the first hearing.",
    },
    {
      questionText:
        "Which Order concerns summoning and attendance of witnesses?",
      correctAnswer: "Order XVI",
      explanation: "Order XVI governs summoning and attendance of witnesses.",
    },
    {
      questionText:
        "Which Order concerns hearing of a suit and examination of witnesses?",
      correctAnswer: "Order XVIII",
      explanation:
        "Order XVIII concerns hearing of the suit and examination of witnesses.",
    },
    {
      questionText: "Which Order concerns judgment and decree?",
      correctAnswer: "Order XX",
      explanation: "Order XX contains rules concerning judgments and decrees.",
    },
    {
      questionText: "Which Order concerns execution of decrees and orders?",
      correctAnswer: "Order XXI",
      explanation:
        "Order XXI sets out the procedure for execution of decrees and orders.",
    },
    {
      questionText: "Which Order concerns temporary injunctions?",
      correctAnswer: "Order XXXIX",
      explanation:
        "Order XXXIX governs temporary injunctions and interlocutory orders.",
    },
    {
      questionText: "Which Order concerns appointment of receivers?",
      correctAnswer: "Order XL",
      explanation: "Order XL concerns appointment and powers of receivers.",
    },
    {
      questionText: "Which Order concerns appeals from original decrees?",
      correctAnswer: "Order XLI",
      explanation:
        "Order XLI provides the procedure for appeals from original decrees.",
    },
    {
      questionText: "Which Order concerns appeals from appellate decrees?",
      correctAnswer: "Order XLII",
      explanation:
        "Order XLII applies relevant appellate procedure to appeals from appellate decrees.",
    },
    {
      questionText: "Which Order concerns appeals from orders?",
      correctAnswer: "Order XLIII",
      explanation:
        "Order XLIII lists appealable orders and procedure for such appeals.",
    },
    {
      questionText: "Which Order concerns review?",
      correctAnswer: "Order XLVII",
      explanation: "Order XLVII governs applications for review.",
    },
    {
      questionText:
        "Which Order concerns suits by or against the Government or public officers?",
      correctAnswer: "Order XXVII",
      explanation:
        "Order XXVII of the CPC sets out procedure for suits by or against the Government or public officers.",
    },
    {
      questionText: "Which section defines decree?",
      correctAnswer: "Section 2(2)",
      explanation:
        "Section 2(2) defines decree and excludes specified decisions.",
    },
    {
      questionText: "Which section defines judgment?",
      correctAnswer: "Section 2(9)",
      explanation:
        "Section 2(9) defines judgment as the statement given by the judge on the grounds of a decree or order.",
    },
    {
      questionText: "Which section defines order?",
      correctAnswer: "Section 2(14)",
      explanation:
        "Section 2(14) defines an order as the formal expression of a decision of a civil court which is not a decree.",
    },
    {
      questionText: "Which section concerns restitution?",
      correctAnswer: "Section 144",
      explanation:
        "Section 144 concerns restitution when a decree or order is varied or reversed.",
    },
    {
      questionText:
        "Which section concerns enlargement of time fixed by the court?",
      correctAnswer: "Section 148",
      explanation:
        "Section 148 permits enlargement of time fixed or granted by the court, subject to law.",
    },
    {
      questionText: "Which section concerns rejection of a plaint?",
      correctAnswer: "Order VII Rule 11",
      explanation:
        "Order VII Rule 11 specifies grounds for rejection of a plaint.",
    },
  ],
  "Constitutional Law": [
    {
      questionText:
        "Which article declares Bangladesh a unitary, independent, sovereign Republic?",
      correctAnswer: "Article 1",
      explanation:
        "Article 1 describes Bangladesh as a unitary, independent, sovereign Republic.",
    },
    {
      questionText: "Which article identifies the state language?",
      correctAnswer: "Article 3",
      explanation:
        "Article 3 provides that the state language of the Republic is Bangla.",
    },
    {
      questionText: "Which article concerns state religion?",
      correctAnswer: "Article 2A",
      explanation:
        "Article 2A addresses the state religion while also providing equal status and equal rights in the practice of other religions.",
    },
    {
      questionText: "Which article concerns supremacy of the Constitution?",
      correctAnswer: "Article 7",
      explanation:
        "Article 7 affirms the supremacy of the Constitution and the people's sovereignty.",
    },
    {
      questionText:
        "Which article concerns fundamental principles of state policy?",
      correctAnswer: "Part II",
      explanation:
        "Part II of the Constitution sets out fundamental principles of state policy.",
    },
    {
      questionText: "Which article concerns equality before law?",
      correctAnswer: "Article 27",
      explanation:
        "Article 27 guarantees equality before law and equal protection of law.",
    },
    {
      questionText:
        "Which article prohibits discrimination on specified grounds?",
      correctAnswer: "Article 28",
      explanation:
        "Article 28 prohibits discrimination on specified grounds and contains stated exceptions.",
    },
    {
      questionText:
        "Which article concerns equality of opportunity in public employment?",
      correctAnswer: "Article 29",
      explanation:
        "Article 29 guarantees equality of opportunity in public employment, subject to its clauses.",
    },
    {
      questionText:
        "Which article concerns protection of the right to life and personal liberty?",
      correctAnswer: "Article 32",
      explanation:
        "Article 32 protects life and personal liberty except in accordance with law.",
    },
    {
      questionText:
        "Which article concerns safeguards as to arrest and detention?",
      correctAnswer: "Article 33",
      explanation:
        "Article 33 provides constitutional safeguards relating to arrest and detention.",
    },
    {
      questionText: "Which article concerns prohibition of forced labour?",
      correctAnswer: "Article 34",
      explanation:
        "Article 34 prohibits all forms of forced labour, subject to specified exceptions.",
    },
    {
      questionText:
        "Which article concerns protection in respect of trial and punishment?",
      correctAnswer: "Article 35",
      explanation:
        "Article 35 provides protections concerning trial, punishment, and related criminal process.",
    },
    {
      questionText: "Which article concerns freedom of movement?",
      correctAnswer: "Article 36",
      explanation:
        "Article 36 protects freedom of movement subject to reasonable restrictions imposed by law.",
    },
    {
      questionText: "Which article concerns freedom of assembly?",
      correctAnswer: "Article 37",
      explanation:
        "Article 37 protects peaceful assembly without arms subject to reasonable restrictions imposed by law.",
    },
    {
      questionText: "Which article concerns freedom of association?",
      correctAnswer: "Article 38",
      explanation:
        "Article 38 protects freedom of association subject to constitutional and legal restrictions.",
    },
    {
      questionText:
        "Which article concerns freedom of thought, conscience, and speech?",
      correctAnswer: "Article 39",
      explanation:
        "Article 39 protects thought, conscience, speech, and press subject to its stated restrictions.",
    },
    {
      questionText:
        "Which article concerns freedom of profession or occupation?",
      correctAnswer: "Article 40",
      explanation:
        "Article 40 protects the right to enter lawful professions, occupations, trades, or businesses.",
    },
    {
      questionText: "Which article concerns freedom of religion?",
      correctAnswer: "Article 41",
      explanation:
        "Article 41 protects freedom of religion, subject to its terms.",
    },
    {
      questionText: "Which article concerns rights to property?",
      correctAnswer: "Article 42",
      explanation:
        "Article 42 recognizes rights to acquire, hold, transfer, or otherwise dispose of property subject to law.",
    },
    {
      questionText:
        "Which article concerns protection of home and correspondence?",
      correctAnswer: "Article 43",
      explanation:
        "Article 43 protects the home and correspondence, subject to reasonable restrictions imposed by law.",
    },
    {
      questionText:
        "Which article empowers the High Court Division to enforce fundamental rights?",
      correctAnswer: "Article 102",
      explanation:
        "Article 102 empowers the High Court Division to issue directions or orders for enforcement of fundamental rights and other purposes.",
    },
    {
      questionText: "Which article concerns appointment of the Chief Justice?",
      correctAnswer: "Article 95",
      explanation:
        "Article 95 concerns appointment of the Chief Justice and other Judges of the Supreme Court.",
    },
    {
      questionText:
        "Which article establishes the Supreme Court of Bangladesh?",
      correctAnswer: "Article 94",
      explanation:
        "Article 94 establishes the Supreme Court, comprising the Appellate Division and High Court Division.",
    },
    {
      questionText:
        "Which article concerns the Appellate Division's jurisdiction to hear appeals?",
      correctAnswer: "Article 103",
      explanation:
        "Article 103 addresses the appellate jurisdiction of the Appellate Division.",
    },
    {
      questionText:
        "Which article concerns the High Court Division's supervisory jurisdiction?",
      correctAnswer: "Article 109",
      explanation:
        "Article 109 gives the High Court Division superintendence and control over subordinate courts and tribunals.",
    },
    {
      questionText: "Which article concerns administrative tribunals?",
      correctAnswer: "Article 117",
      explanation: "Article 117 provides for administrative tribunals.",
    },
    {
      questionText:
        "Which article concerns the office of the Attorney-General?",
      correctAnswer: "Article 64",
      explanation:
        "Article 64 provides for the Attorney-General for Bangladesh.",
    },
    {
      questionText:
        "Which article concerns the President's power to promulgate ordinances?",
      correctAnswer: "Article 93",
      explanation:
        "Article 93 provides for ordinance-making when Parliament stands dissolved or is not in session, subject to constitutional limits.",
    },
    {
      questionText: "Which article concerns the duration of Parliament?",
      correctAnswer: "Article 72",
      explanation:
        "Article 72 concerns the summoning, prorogation, and dissolution of Parliament and its duration.",
    },
    {
      questionText: "Which article concerns the composition of Parliament?",
      correctAnswer: "Article 65",
      explanation:
        "Article 65 provides for Parliament, its elected membership, and reserved seats.",
    },
    {
      questionText: "Which article concerns the Prime Minister and Cabinet?",
      correctAnswer: "Article 55",
      explanation:
        "Article 55 provides for the Cabinet, headed by the Prime Minister, to exercise executive power.",
    },
    {
      questionText: "Which article concerns the President of Bangladesh?",
      correctAnswer: "Article 48",
      explanation:
        "Article 48 concerns the President, including election and constitutional position.",
    },
    {
      questionText: "Which article concerns the Election Commission?",
      correctAnswer: "Article 118",
      explanation: "Article 118 provides for an Election Commission.",
    },
    {
      questionText:
        "Which article concerns the Comptroller and Auditor-General?",
      correctAnswer: "Article 127",
      explanation:
        "Article 127 provides for the office of the Comptroller and Auditor-General.",
    },
    {
      questionText: "Which article concerns the Public Service Commission?",
      correctAnswer: "Article 137",
      explanation:
        "Article 137 provides for one or more public service commissions.",
    },
    {
      questionText: "Which article concerns amendment of the Constitution?",
      correctAnswer: "Article 142",
      explanation:
        "Article 142 prescribes the procedure for amendment of the Constitution.",
    },
    {
      questionText: "Which article concerns emergency provisions?",
      correctAnswer: "Article 141A",
      explanation:
        "Article 141A empowers the President to proclaim an emergency in constitutionally specified circumstances.",
    },
    {
      questionText:
        "Which article sets out the oath of office for the President?",
      correctAnswer: "Article 148",
      explanation:
        "Article 148 and the Third Schedule prescribe oaths of office for constitutional officeholders.",
    },
    {
      questionText:
        "Which article concerns separation of judiciary from the executive?",
      correctAnswer: "Article 22",
      explanation:
        "Article 22 directs the State to ensure separation of the judiciary from the executive organs of the State.",
    },
    {
      questionText: "Which article concerns local government?",
      correctAnswer: "Articles 59-60",
      explanation:
        "Articles 59 and 60 provide for local government in every administrative unit.",
    },
    {
      questionText:
        "Which article concerns the state's responsibility to provide basic necessities?",
      correctAnswer: "Article 15",
      explanation:
        "Article 15 states fundamental responsibilities of the State concerning basic necessities.",
    },
    {
      questionText: "Which article concerns free and compulsory education?",
      correctAnswer: "Article 17",
      explanation: "Article 17 sets out state measures concerning education.",
    },
    {
      questionText: "Which article concerns public health and morality?",
      correctAnswer: "Article 18",
      explanation:
        "Article 18 addresses public health and morality as fundamental principles of state policy.",
    },
    {
      questionText: "Which article concerns equality of men and women?",
      correctAnswer: "Article 19",
      explanation:
        "Article 19 concerns equality of opportunity and participation of women in national life.",
    },
    {
      questionText: "Which article concerns work as a right and duty?",
      correctAnswer: "Article 20",
      explanation:
        "Article 20 addresses work as a right, duty, and matter of honour for every capable citizen.",
    },
    {
      questionText:
        "Which article concerns duties of citizens and public servants?",
      correctAnswer: "Article 21",
      explanation:
        "Article 21 sets out duties of citizens and persons in the service of the Republic.",
    },
    {
      questionText:
        "Which article recognizes international peace and security?",
      correctAnswer: "Article 25",
      explanation:
        "Article 25 states principles concerning international peace, security, and solidarity.",
    },
    {
      questionText: "Which article concerns retrospective criminal laws?",
      correctAnswer: "Article 35(1)",
      explanation:
        "Article 35(1) prohibits conviction for conduct not an offence when done and imposes limits on retrospective penalties.",
    },
    {
      questionText: "Which article protects against double jeopardy?",
      correctAnswer: "Article 35(2)",
      explanation:
        "Article 35(2) prohibits prosecuting and punishing a person more than once for the same offence.",
    },
    {
      questionText:
        "Which article prohibits torture and cruel, inhuman, or degrading punishment?",
      correctAnswer: "Article 35(5)",
      explanation:
        "Article 35(5) prohibits torture and cruel, inhuman, or degrading punishment or treatment.",
    },
  ],
  "Legal Reasoning": [
    {
      questionText: "What does the maxim 'stare decisis' require?",
      correctAnswer: "Follow binding precedent",
      explanation:
        "Stare decisis is the principle that courts follow binding precedents.",
    },
    {
      questionText: "What does 'ratio decidendi' identify?",
      correctAnswer: "The legal reason necessary for the decision",
      explanation:
        "Ratio decidendi is the principle of law on which a decision is based.",
    },
    {
      questionText: "What is 'obiter dictum'?",
      correctAnswer: "A judicial observation not essential to the decision",
      explanation:
        "Obiter dicta are observations not necessary to the ratio of the case.",
    },
    {
      questionText: "What does 'mens rea' generally refer to?",
      correctAnswer: "The guilty mind or required mental element",
      explanation:
        "Mens rea describes the mental element required for a criminal offence.",
    },
    {
      questionText: "What does 'actus reus' generally refer to?",
      correctAnswer: "The prohibited act or conduct element",
      explanation:
        "Actus reus describes the external conduct or result element of an offence.",
    },
    {
      questionText: "What does 'audi alteram partem' require?",
      correctAnswer: "Hear the other side",
      explanation:
        "Audi alteram partem is a rule of natural justice requiring a fair opportunity to be heard.",
    },
    {
      questionText: "What does 'nemo judex in causa sua' prohibit?",
      correctAnswer: "A person judging their own cause",
      explanation: "The maxim expresses the rule against bias in adjudication.",
    },
    {
      questionText:
        "What is the ordinary meaning of 'ignorantia juris non excusat'?",
      correctAnswer: "Ignorance of law is no excuse",
      explanation:
        "The maxim states that ignorance of law ordinarily does not excuse its breach.",
    },
    {
      questionText: "What does 'ubi jus ibi remedium' express?",
      correctAnswer: "Where there is a right, there is a remedy",
      explanation:
        "The maxim links the recognition of a legal right with an available remedy.",
    },
    {
      questionText: "What does 'actus non facit reum nisi mens sit rea' mean?",
      correctAnswer:
        "An act does not make a person guilty without a guilty mind",
      explanation:
        "The maxim expresses the general need for a prohibited act and the required mental element.",
    },
    {
      questionText: "What is the function of a binding precedent?",
      correctAnswer: "To constrain lower courts on the legal rule decided",
      explanation:
        "A binding precedent requires lower courts to apply the relevant ratio within the court hierarchy.",
    },
    {
      questionText:
        "Which part of a judgment is generally binding as precedent?",
      correctAnswer: "Ratio decidendi",
      explanation:
        "The ratio decidendi, rather than obiter dicta, is generally the binding part of a judgment.",
    },
    {
      questionText: "How should a court distinguish a precedent?",
      correctAnswer: "Identify a material factual or legal difference",
      explanation:
        "A precedent may be distinguished where a material difference makes its rule inapplicable.",
    },
    {
      questionText: "What is persuasive authority?",
      correctAnswer:
        "Authority a court may consider but is not bound to follow",
      explanation:
        "Persuasive authority may inform reasoning but does not compel the court.",
    },
    {
      questionText: "What is the purpose of statutory interpretation?",
      correctAnswer: "Determine and apply the meaning of legislation",
      explanation:
        "Interpretation identifies the meaning of statutory language in context and applies it to the dispute.",
    },
    {
      questionText: "What does the literal rule prioritize?",
      correctAnswer: "The ordinary meaning of statutory words",
      explanation:
        "The literal approach starts with the ordinary grammatical meaning of the statutory text.",
    },
    {
      questionText: "What is the mischief rule designed to address?",
      correctAnswer: "The defect or mischief the statute intended to remedy",
      explanation:
        "The mischief approach considers the prior law's defect and the remedy Parliament enacted.",
    },
    {
      questionText:
        "What does the golden rule allow when literal meaning is absurd?",
      correctAnswer: "A limited modification to avoid absurdity",
      explanation:
        "The golden rule permits a limited departure from ordinary meaning to avoid an absurd result.",
    },
    {
      questionText: "What is a rebuttable presumption?",
      correctAnswer: "An inference that may be displaced by contrary evidence",
      explanation:
        "A rebuttable presumption applies unless sufficient evidence rebuts it.",
    },
    {
      questionText: "What is the burden of persuasion?",
      correctAnswer:
        "The obligation to convince the fact-finder to the required standard",
      explanation:
        "The burden of persuasion concerns the level of proof needed to establish an issue.",
    },
    {
      questionText: "What does 'beyond reasonable doubt' describe?",
      correctAnswer: "The criminal standard of proof",
      explanation:
        "Beyond reasonable doubt is the standard ordinarily required to establish criminal guilt.",
    },
    {
      questionText: "What does 'balance of probabilities' describe?",
      correctAnswer: "The civil standard of proof",
      explanation:
        "The balance of probabilities asks whether a fact is more likely than not.",
    },
    {
      questionText: "What is a material fact?",
      correctAnswer:
        "A fact that can affect the outcome under the governing rule",
      explanation:
        "Material facts are those relevant to applying the legal rule to the dispute.",
    },
    {
      questionText: "What is a ratio in legal reasoning?",
      correctAnswer: "A rule applied to material facts to reach a conclusion",
      explanation:
        "A legal ratio connects the governing rule to the material facts and conclusion.",
    },
    {
      questionText:
        "What does 'expressio unius est exclusio alterius' suggest?",
      correctAnswer: "Express mention of one may imply exclusion of others",
      explanation:
        "The maxim is a contextual interpretive aid, not an inflexible rule.",
    },
    {
      questionText: "What does 'ejusdem generis' mean?",
      correctAnswer:
        "General words may be limited by the specific class preceding them",
      explanation:
        "The doctrine may confine general words to the same genus as preceding specific words.",
    },
    {
      questionText: "What does 'noscitur a sociis' mean?",
      correctAnswer: "A word is known by the company it keeps",
      explanation: "The maxim interprets a word in light of associated words.",
    },
    {
      questionText:
        "What does 'generalia specialibus non derogant' generally express?",
      correctAnswer: "A general provision does not override a specific one",
      explanation:
        "The maxim favors a specific provision over a conflicting general provision.",
    },
    {
      questionText: "What is an issue of law?",
      correctAnswer:
        "A question about the applicable legal rule or its meaning",
      explanation:
        "An issue of law concerns the governing rule, its interpretation, or legal consequence.",
    },
    {
      questionText: "What is an issue of fact?",
      correctAnswer: "A disputed question about what occurred",
      explanation:
        "An issue of fact concerns whether an alleged event or circumstance is established by evidence.",
    },
    {
      questionText: "What is a mixed question of law and fact?",
      correctAnswer: "Application of a legal standard to established facts",
      explanation:
        "A mixed question applies the governing law to the facts found.",
    },
    {
      questionText:
        "What is the purpose of distinguishing material from immaterial facts?",
      correctAnswer: "Focus analysis on facts that affect the legal outcome",
      explanation:
        "Materiality prevents irrelevant facts from distracting from the legal test.",
    },
    {
      questionText: "What is an analogy in case analysis?",
      correctAnswer: "Reasoning from materially similar cases",
      explanation:
        "Analogical reasoning compares material facts and applies a similar legal treatment.",
    },
    {
      questionText: "What is a distinguishing fact?",
      correctAnswer:
        "A material fact that makes the precedent's rule inapplicable",
      explanation:
        "A distinguishing fact provides a legally relevant basis not to apply a prior decision.",
    },
    {
      questionText: "What does 'in pari materia' describe?",
      correctAnswer: "Legislation dealing with the same subject matter",
      explanation:
        "Related statutes may be read together when they concern the same subject.",
    },
    {
      questionText: "What does 'lex specialis' generally mean?",
      correctAnswer: "The more specific rule governs over the general rule",
      explanation:
        "The specific rule ordinarily controls where it conflicts with a general rule on the same issue.",
    },
    {
      questionText: "What does 'lex posterior' generally mean?",
      correctAnswer: "A later law may prevail over an earlier inconsistent law",
      explanation:
        "The later enactment may govern an inconsistency, subject to legislative intent and hierarchy.",
    },
    {
      questionText: "What is judicial review?",
      correctAnswer: "Review of legality or constitutionality by a court",
      explanation:
        "Judicial review allows courts to examine whether public action complies with governing law.",
    },
    {
      questionText: "What is proportionality analysis concerned with?",
      correctAnswer: "Whether a measure is suitable, necessary, and balanced",
      explanation:
        "Proportionality tests the relationship between a legitimate aim and the rights-restricting measure.",
    },
    {
      questionText: "What is the principle of legality?",
      correctAnswer: "Public power must have lawful authority",
      explanation:
        "The principle requires public authorities to act within powers conferred by law.",
    },
    {
      questionText: "What does 'ultra vires' mean?",
      correctAnswer: "Beyond legal power or authority",
      explanation:
        "An act is ultra vires when it exceeds the authority granted by law.",
    },
    {
      questionText: "What does 'bona fide' mean?",
      correctAnswer: "In good faith",
      explanation:
        "Bona fide describes an act done honestly and in good faith.",
    },
    {
      questionText: "What does 'mala fide' mean?",
      correctAnswer: "In bad faith",
      explanation:
        "Mala fide describes action taken with bad faith or improper purpose.",
    },
    {
      questionText: "What does 'ex parte' mean?",
      correctAnswer: "In the absence of or without notice to the other side",
      explanation:
        "An ex parte proceeding is taken in the absence of the opposing party, subject to procedural safeguards.",
    },
    {
      questionText: "What does 'inter alia' mean?",
      correctAnswer: "Among other things",
      explanation:
        "Inter alia indicates that a statement lists some, but not necessarily all, relevant matters.",
    },
    {
      questionText: "What does 'prima facie' mean?",
      correctAnswer: "At first sight or sufficient unless rebutted",
      explanation:
        "Prima facie describes evidence or a case sufficient on its face, subject to rebuttal.",
    },
    {
      questionText: "What does 'de facto' mean?",
      correctAnswer: "In fact or in practice",
      explanation:
        "De facto describes an actual condition, whether or not formally established.",
    },
    {
      questionText: "What does 'de jure' mean?",
      correctAnswer: "By law or as a matter of legal right",
      explanation: "De jure describes a status recognized by law.",
    },
    {
      questionText: "What does 'suo motu' mean?",
      correctAnswer: "On the court's own motion",
      explanation:
        "Suo motu action is initiated by the court without a party's request.",
    },
    {
      questionText: "What does 'in camera' mean?",
      correctAnswer: "In private proceedings",
      explanation:
        "In camera proceedings are conducted privately rather than in open court.",
    },
  ],
};

const DISTRACTORS: Record<Subject, readonly string[]> = {
  "Criminal Law": ["Section 302", "Section 420", "Section 499"],
  CrPC: ["Section 54", "Section 154", "Section 173"],
  Evidence: ["Section 24", "Section 101", "Section 118"],
  CPC: ["Section 9", "Section 11", "Section 151"],
  "Constitutional Law": ["Article 32", "Article 102", "Article 142"],
  "Legal Reasoning": [
    "Ratio decidendi",
    "Audi alteram partem",
    "Stare decisis",
  ],
};

function createQuestionDocuments(
  examId: ObjectId,
  subject: Subject,
  crossoverSubject: Subject,
  orderOffset: number
): ExamQuestion[] {
  return Array.from({ length: 40 }, (_, index) => {
    const questionSubject = index < 36 ? subject : crossoverSubject;
    const pool = QUESTION_POOL[questionSubject];
    const seedIndex =
      index < 36 ? orderOffset + index : orderOffset + index - 36;
    const seed = pool[seedIndex % pool.length];
    const correctOptionIndex = index % 4;
    const options = DISTRACTORS[questionSubject]
      .filter((option) => option !== seed.correctAnswer)
      .slice(0, 3);

    while (options.length < 3) {
      options.push(`Incorrect ${questionSubject} option ${options.length + 1}`);
    }

    options.splice(correctOptionIndex, 0, seed.correctAnswer);

    return {
      _id: new ObjectId(),
      examId,
      order: index + 1,
      questionText: seed.questionText,
      options,
      correctOptionIndex,
      marks: 1,
      subject: questionSubject,
      explanation: seed.explanation,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

function makeScheduledAt(now: Date, daysFromNow: number): Date {
  const scheduledAt = new Date(now);
  scheduledAt.setDate(scheduledAt.getDate() + daysFromNow);
  scheduledAt.setHours(20, 0, 0, 0);
  return scheduledAt;
}

export async function runCourseSeed(
  adminUserId: ObjectId
): Promise<CourseSeedResult> {
  await getDb();

  const courseCollection = await coursesCol();
  const existing = await courseCollection.findOne({ slug: COURSE_SLUG });

  if (existing) {
    return {
      courseId: existing._id.toString(),
      segments: 0,
      subSegments: 0,
      exams: 0,
      questions: 0,
      skipped: true,
    };
  }

  const now = new Date();
  const courseId = new ObjectId();
  const exams: Exam[] = [];
  const questions: ExamQuestion[] = [];
  let subSegmentCount = 0;

  const segments: Segment[] = MONTHS.map((month, monthIndex) => {
    const segmentId = new ObjectId();
    const subSegments = month.subSegments.map((seed, subSegmentIndex) => {
      const subSegmentId = new ObjectId();
      const payload = { ...seed.payload };

      if (seed.kind === "live" && monthIndex === 0) {
        payload.scheduledAt = makeScheduledAt(now, 3);
      }

      subSegmentCount += 1;

      return {
        _id: subSegmentId,
        title: seed.title,
        description: "",
        order: subSegmentIndex,
        kind: seed.kind,
        isFree: true,
        examIds: [],
        payload,
      } satisfies SubSegment;
    });
    const examId = new ObjectId();
    const crossoverSubject = MONTHS[(monthIndex + 1) % MONTHS.length].subject;
    const examQuestions = createQuestionDocuments(
      examId,
      month.subject,
      crossoverSubject,
      monthIndex * 10
    );

    exams.push({
      _id: examId,
      title: month.examTitle,
      description: `${month.title} preliminary model test.`,
      thumbnailUrl: IMAGE_URL,
      thumbnailPublicId: undefined,
      courseId,
      segmentId,
      subSegmentId: subSegments[subSegments.length - 1]._id as ObjectId,
      kind: "preliminary",
      type: "paid",
      price: 0,
      discountedPrice: undefined,
      validityMonths: 12,
      discountTill: undefined,
      purchaseMode: "complete",
      durationMinutes: 60,
      passMarkPercent: 50,
      negativeMarking: 0.25,
      questionsPerAttempt: 40,
      scheduledAt: now,
      closesAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      totalQuestions: 40,
      totalMarks: 40,
      status: "published",
      order: monthIndex + 1,
      createdBy: adminUserId,
      segments: [],
      createdAt: now,
      updatedAt: now,
    } satisfies Exam);
    questions.push(...examQuestions);

    return {
      _id: segmentId,
      title: month.title,
      description: month.description,
      order: monthIndex,
      isFree: true,
      price: 0,
      examIds: [],
      subSegments,
    };
  });

  const course: Course = {
    _id: courseId,
    title: "BJS Foundation — Complete 6-Month Program",
    slug: COURSE_SLUG,
    category: "BJS",
    type: "free",
    description:
      "A complete free foundation course for the Bangladesh Judicial Service preliminary exam. 6 months, 36 classes, 6 model tests, and lifetime access to all study materials.",
    longDescription:
      "This course is designed for students who are beginning their preparation for the Bangladesh Judicial Service preliminary exam. It walks you through every major subject area over 6 months with structured weekly lessons, live doubt sessions, video lectures, and downloadable study materials.\n\nEvery month ends with a full-length model test built to the official exam pattern. You also get access to recorded lectures and mentor-written notes for every topic.\n\nThe course is entirely free. You only need a LegalPath Bangladesh account to enroll.",
    tags: ["BJS", "Foundation", "Free", "Judiciary"],
    level: "beginner",
    price: 0,
    currency: "BDT",
    durationWeeks: 26,
    durationLabel: "6 months",
    totalClasses: 36,
    totalMockTests: 6,
    totalMaterials: 60,
    segments,
    mentorIds: [],
    isPublished: true,
    status: "published",
    order: 1,
    createdBy: adminUserId,
    createdAt: now,
    updatedAt: now,
  };

  await courseCollection.insertOne(course);
  await (await examsCol()).insertMany(exams);
  await (await examQuestionsCol()).insertMany(questions);

  return {
    courseId: courseId.toString(),
    segments: segments.length,
    subSegments: subSegmentCount,
    exams: exams.length,
    questions: questions.length,
    skipped: false,
  };
}
