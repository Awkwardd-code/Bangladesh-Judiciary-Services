import type { AboutShape } from "@/lib/types/about";

export function AboutMission({ about }: { about: AboutShape }) {
  const paragraphs = Array.isArray(about.missionParagraphs)
    ? about.missionParagraphs.filter(Boolean)
    : [];

  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {about.missionKicker || "Our mission"}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-primary lg:text-4xl">
              {about.missionTitle ||
                "To make high-quality judicial prep accessible, practical, and disciplined."}
            </h2>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-col gap-5">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={`${paragraph.slice(0, 20)}-${index}`}
                    className="max-w-prose text-base leading-7 text-muted lg:text-[16px]"
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="max-w-prose text-base leading-7 text-muted lg:text-[16px]">
                  BJS Prep was built to address the real pain points students face while preparing for the Bangladesh Judicial Service examination.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
