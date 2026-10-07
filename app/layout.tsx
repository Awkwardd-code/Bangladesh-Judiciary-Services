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
    default: "BJS Prep | Bangladesh Judicial Service Exam Preparation",
    template: "%s | BJS Prep",
  },
  description:
    "Structured, mentor-led preparation for the Bangladesh Judicial Service exam.",
  openGraph: {
    title: "BJS Prep",
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
