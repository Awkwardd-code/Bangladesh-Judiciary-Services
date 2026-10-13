import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-heading",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LegalPath Bangladesh | Bangladesh Judicial Service Exam Preparation",
    template: "%s | LegalPath Bangladesh",
  },
  description:
    "Structured, mentor-led preparation for the Bangladesh Judicial Service exam.",
  openGraph: {
    title: "LegalPath Bangladesh",
    description:
      "Courses, model tests, and written evaluation for serious candidates.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}
