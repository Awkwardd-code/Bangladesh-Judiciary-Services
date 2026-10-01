import { Mail, MapPin, Phone, Share2 } from "lucide-react";
const details = [
  [Mail, "Email", "support@bjsprep.com"],
  [Phone, "Phone", "+880 1234 567890"],
  [MapPin, "Office", "Rajshahi, Bangladesh"],
];
export function ContactInfo() {
  return (
    <div className="lg:pt-4">
      {details.map(([Icon, label, value]) => (
        <div key={String(label)} className="mb-5 flex gap-4 lg:mb-7">
          <Icon className="mt-1 shrink-0 text-accent" size={21} />
          <div>
            <p className="text-sm font-semibold text-primary">
              {String(label)}
            </p>
            <p className="mt-1 text-sm text-muted">{String(value)}</p>
          </div>
        </div>
      ))}
      <p className="mt-8 text-sm font-semibold text-primary lg:mt-10">Follow us</p>
      <div className="mt-4 flex gap-3">
        <SocialIcon label="Facebook" />
        <SocialIcon label="Youtube">
          <Share2 size={17} />
        </SocialIcon>
        <SocialIcon label="LinkedIn">
          <Share2 size={17} />
        </SocialIcon>
      </div>
      <p className="sr-only">
        PLACEHOLDER — replace contact values before launch.
      </p>
    </div>
  );
}
function SocialIcon({
  label,
  children = <span className="text-sm font-semibold">f</span>,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  );
}
