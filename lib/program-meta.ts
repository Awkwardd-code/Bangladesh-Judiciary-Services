export type ProgramFeature = {
  icon: string;
  label: string;
};

export type ProgramJourneyStep = {
  number: number;
  title: string;
};

export type ProgramMeta = {
  code: "BJS" | "BAR" | "LLB";
  agencyBadge: string;
  name: string;
  description: string;
  features: ProgramFeature[];
  journey: ProgramJourneyStep[];
  ctaLabel: string;
};

export const PROGRAMS: ProgramMeta[] = [
  {
    code: "BJS",
    agencyBadge: "Bangladesh Judicial Service",
    name: "BJS Program",
    description:
      "Crack the BJS exam with a real-clock prelim engine, mentor-graded written answers, and a full archive of past papers.",
    features: [
      { icon: "FileText", label: "Live Exams" },
      { icon: "FolderOpen", label: "Exam Archive" },
      { icon: "Calendar", label: "Exam Routine" },
      { icon: "ClipboardCheck", label: "Syllabus & Topics" },
      { icon: "BarChart3", label: "Live Exam Results" },
      { icon: "AlertTriangle", label: "Wrong & Unanswered" },
      { icon: "Star", label: "Favorite Questions" },
      { icon: "Trophy", label: "Ranked Merit List" },
      { icon: "ListChecks", label: "Program Details" },
      { icon: "BookOpen", label: "Book References" },
      { icon: "Lightbulb", label: "Exam Suggestions" },
      { icon: "Download", label: "Study Notes & PDFs" },
      { icon: "TrendingUp", label: "Deep Analytics" },
      { icon: "Megaphone", label: "Notices & Updates" },
      { icon: "Video", label: "Live Classes" },
    ],
    journey: [
      { number: 1, title: "Pick a topic" },
      { number: 2, title: "Practice MCQs" },
      { number: 3, title: "Sit the live prelim" },
      { number: 4, title: "Submit written" },
      { number: 5, title: "Get mentor feedback" },
    ],
    ctaLabel: "Explore BJS",
  },
  {
    code: "BAR",
    agencyBadge: "Bangladesh Bar Council",
    name: "BAR Program",
    description:
      "A focused BAR Council track — MCQ + written modules, live timed exams, and ranked merit lists after every cycle.",
    features: [
      { icon: "FileText", label: "Live Exams" },
      { icon: "FolderOpen", label: "Exam Archive" },
      { icon: "Calendar", label: "Exam Routine" },
      { icon: "ClipboardCheck", label: "Syllabus & Topics" },
      { icon: "BarChart3", label: "Live Exam Results" },
      { icon: "AlertTriangle", label: "Wrong & Unanswered" },
      { icon: "Star", label: "Favorite Questions" },
      { icon: "Trophy", label: "Ranked Merit List" },
      { icon: "ListChecks", label: "Program Details" },
      { icon: "BookOpen", label: "Book References" },
      { icon: "Lightbulb", label: "Exam Suggestions" },
      { icon: "Download", label: "Study Notes & PDFs" },
      { icon: "TrendingUp", label: "Deep Analytics" },
      { icon: "Megaphone", label: "Notices & Updates" },
      { icon: "Video", label: "Live Classes" },
    ],
    journey: [
      { number: 1, title: "Choose subject" },
      { number: 2, title: "Practice prelims" },
      { number: 3, title: "Attempt live exam" },
      { number: 4, title: "Review wrongs" },
      { number: 5, title: "Climb the merit list" },
    ],
    ctaLabel: "Explore BAR",
  },
  {
    code: "LLB",
    agencyBadge: "LL.B Academy (1st – 4th year)",
    name: "LL.B Program",
    description:
      "Year-by-year syllabus, daily task chains, subject PDFs, and live tests built around your university routine.",
    features: [
      { icon: "Video", label: "Live & upcoming" },
      { icon: "ListChecks", label: "Daily task chain" },
      { icon: "FileText", label: "Subject PDFs" },
      { icon: "Calendar", label: "Exam Routine" },
      { icon: "BookOpen", label: "Year-wise syllabus" },
      { icon: "FolderOpen", label: "Exam Archive" },
      { icon: "TrendingUp", label: "Deep Analytics" },
    ],
    journey: [
      { number: 1, title: "Pick your year" },
      { number: 2, title: "Open today's task" },
      { number: 3, title: "Read subject PDF" },
      { number: 4, title: "Take the topic quiz" },
      { number: 5, title: "Track yearly progress" },
    ],
    ctaLabel: "Explore LL.B",
  },
];
