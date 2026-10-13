"use client";

import Link from "next/link";
import { BookOpen, CreditCard, FileText, Megaphone } from "lucide-react";

import { Card } from "@/components/ui/card";

const actions = [
  {
    href: "/admin/courses/new",
    icon: BookOpen,
    title: "Add course",
    description: "Launch a new course or program.",
  },
  {
    href: "/admin/exams/new",
    icon: FileText,
    title: "Add exam",
    description: "Create a new model test.",
  },
  {
    href: "/admin/notices",
    icon: Megaphone,
    title: "Post notice",
    description: "Publish a platform announcement.",
  },
  {
    href: "/admin/payments",
    icon: CreditCard,
    title: "Record payment",
    description: "Review or log a payment entry.",
  },
];

export function AdminOverviewQuickActions() {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-bold text-primary">
        Quick actions
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="block">
            <Card className="flex h-full items-center gap-4 border-border bg-card p-5 transition-colors hover:bg-muted/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/5 text-primary">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted">{description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
