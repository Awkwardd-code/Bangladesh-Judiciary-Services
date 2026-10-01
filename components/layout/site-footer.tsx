"use client";

import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

const aboutLinks = [
  ["Home", "/"],
  ["About", "/about"],
  ["Mentors", "/mentors"],
  ["Success Stories", "/success-stories"],
  ["Contact", "/contact"],
];

const courseLinks = [
  ["All Courses", "/courses"],
  ["Model Tests", "/model-tests"],
  ["Preliminary Batch", "/courses?category=preliminary"],
  ["Written Batch", "/courses?category=written"],
  ["Foundation", "/courses?category=foundation"],
];

const legalLinks = [
  ["Terms of Service", "/terms"],
  ["Privacy Policy", "/privacy"],
  ["Refund Policy", "/terms#refund"],
  ["Contact Support", "/contact"],
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", mark: "f" },
  { label: "YouTube", href: "https://youtube.com", mark: "play" },
  { label: "LinkedIn", href: "https://linkedin.com", mark: "in" },
  { label: "Twitter", href: "https://twitter.com", mark: "X" },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(email);
    setEmail("");
  }

  return (
    <footer className="relative w-full overflow-hidden bg-primary-dark text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent opacity-[0.04] blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 border-b border-cream/10 pt-14 pb-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/"
              className="cursor-pointer font-heading text-xl font-bold text-cream transition-colors duration-150"
            >
              BJS Prep
            </Link>
            <p className="mt-2 text-[13px] text-cream/60">
              Preparation for the Bangladesh Judicial Service exam.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors duration-150 hover:bg-cream/10 hover:text-cream"
              >
                {social.mark === "play" ? (
                  <span
                    aria-hidden="true"
                    className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="text-sm font-bold leading-none"
                  >
                    {social.mark}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="max-w-sm text-sm leading-7 text-cream/70">
              Structured, mentor-led courses and model tests for the Bangladesh
              Judicial Service exam. Built for serious candidates preparing
              from campus to court.
            </p>

            <div className="mt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-cream/40">
                Reach Us
              </h2>
              {/* PLACEHOLDER: replace with real contact information before launch. */}
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="mailto:support@bjsprep.com"
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-cream/70 transition-colors duration-150 hover:text-cream"
                >
                  <Mail aria-hidden="true" size={14} className="text-accent" />
                  support@bjsprep.com
                </Link>
                <Link
                  href="tel:+8801234567890"
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-cream/70 transition-colors duration-150 hover:text-cream"
                >
                  <Phone aria-hidden="true" size={14} className="text-accent" />
                  +880 1234 567890
                </Link>
              </div>
            </div>
          </div>

          <FooterColumn title="About" links={aboutLinks} className="lg:col-span-2" />
          <FooterColumn title="Courses" links={courseLinks} className="lg:col-span-3" />

          <div className="lg:col-span-3">
            <FooterColumn title="Legal" links={legalLinks} />
            <div className="mt-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-cream/40">
                Support Hours
              </h3>
              <p className="mt-2 text-xs text-cream/50">
                Sat – Thu · 10:00 AM – 7:00 PM (BST)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-cream/10 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold text-cream">
              Stay updated.
            </h2>
            <p className="mt-1 text-[13px] text-cream/60">
              Exam dates, new mock tests, and course announcements.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <form
              onSubmit={subscribe}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 w-full rounded-md border border-cream/15 bg-cream/[0.06] px-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-accent focus:ring-2 focus:ring-accent/40 sm:w-72"
              />
              <button
                type="submit"
                className="h-10 cursor-pointer rounded-md bg-accent px-5 text-sm font-medium text-primary-dark transition-colors duration-150 hover:bg-accent/90"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-2 text-[11px] text-cream/40">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-cream/50">
            © 2026 BJS Prep. All rights reserved.
          </p>
          <span aria-hidden="true" className="hidden text-accent md:block">
            ·
          </span>
          <nav aria-label="Legal links" className="flex items-center gap-4">
            <Link
              href="/terms"
              className="cursor-pointer text-xs text-cream/50 transition-colors duration-150 hover:text-cream"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="cursor-pointer text-xs text-cream/50 transition-colors duration-150 hover:text-cream"
            >
              Privacy
            </Link>
            <Link
              href="/sitemap.xml"
              className="cursor-pointer text-xs text-cream/50 transition-colors duration-150 hover:text-cream"
            >
              Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: string[][];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-cream/40">
        {title}
      </h2>
      <ul className="flex flex-col gap-3">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="cursor-pointer text-sm text-cream/70 transition-colors duration-150 hover:text-cream"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
