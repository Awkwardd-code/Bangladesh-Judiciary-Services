import { Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/sections/contact-form";
import { Card } from "@/components/ui/card";

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "support@bjsprep.com",
    href: "mailto:support@bjsprep.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+880 1234 567890",
    href: "tel:+8801234567890",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Rajshahi, Bangladesh",
  },
];

const socialLinks = [
  {
    mark: "f",
    label: "Facebook",
    href: "https://facebook.com/bjsprep",
  },
  {
    mark: "play",
    label: "YouTube",
    href: "https://youtube.com/@bjsprep",
  },
  {
    mark: "in",
    label: "LinkedIn",
    href: "https://linkedin.com/company/bjsprep",
  },
];

export function ContactGrid() {
  return (
    <section className="bg-cream px-6 pb-20 lg:pb-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="font-heading text-xl font-semibold text-primary">
            Get in touch
          </h2>
          <p className="mt-2 text-sm text-muted">
            Reach us through any of these channels.
          </p>

          {/* PLACEHOLDER — replace with real contact info. */}
          <div className="mt-8 flex flex-col gap-6">
            {contactDetails.map((detail) => {
              const Icon = detail.icon;
              const value = detail.href ? (
                <a
                  href={detail.href}
                  className="mt-1 inline-block cursor-pointer text-[15px] font-medium text-foreground hover:text-primary"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="mt-1 text-[15px] font-medium text-foreground">
                  {detail.value}
                </p>
              );

              return (
                <div key={detail.label} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5">
                    <Icon aria-hidden="true" size={18} className="text-primary" />
                  </span>
                  <div>
                    <p className="text-[13px] uppercase tracking-wide text-muted">
                      {detail.label}
                    </p>
                    {value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <p className="text-[13px] uppercase tracking-wide text-muted">
              Follow us
            </p>
            <div className="mt-3 flex gap-3">
              {socialLinks.map((social) => {
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-primary/5 hover:text-primary"
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
                  </a>
                );
              })}
            </div>
          </div>

          <Card className="mt-10 p-5">
            <h3 className="text-sm font-semibold text-primary">Support hours</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Saturday – Thursday, 10:00 AM – 7:00 PM (BST)
            </p>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}