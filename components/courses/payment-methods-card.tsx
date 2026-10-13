import { QrCode, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";

const methodConfig = [
  {
    name: "bKash",
    label: "Send Money",
    number: process.env.NEXT_PUBLIC_BKASH_NUMBER ?? "",
    icon: Wallet,
    type: "bkash",
  },
  {
    name: "Nagad",
    label: "Send Money",
    number: process.env.NEXT_PUBLIC_NAGAD_NUMBER ?? "",
    icon: Wallet,
    type: "nagad",
  },
  {
    name: "Upay",
    label: "Send Money",
    number: process.env.NEXT_PUBLIC_UPAY_NUMBER ?? "",
    icon: Wallet,
    type: "upay",
  },
] as const;

export function PaymentMethodsCard() {
  return (
    <section className="bg-cream pb-8">
      <div className="mx-auto max-w-4xl px-6">
        <Card className="border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold text-primary">
              Payment details
            </h2>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {methodConfig.map((method) => {
              const Icon = method.icon;

              return (
                <div
                  key={method.name}
                  className="flex flex-col gap-3 rounded-md border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/5 text-primary">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="font-sans text-[15px] font-semibold text-primary">
                          {method.name}
                        </p>
                        <p className="text-xs text-muted">{method.label}</p>
                      </div>
                    </div>

                  </div>

                  <div className="font-heading text-lg font-semibold text-primary">
                    {method.number || "Contact support for payment details"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {methodConfig.map((method) => (
              <div
                key={`${method.name}-qr`}
                className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-muted/5"
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <QrCode size={40} className="text-muted" />
                  <span className="text-[12px] text-muted">QR coming soon</span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted">
            After sending the money, keep the transaction ID handy. You&apos;ll
            need it in the form below.
          </p>
        </Card>
      </div>
    </section>
  );
}
