type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalContentProps = {
  sections: LegalSection[];
};

export function LegalContent({ sections }: LegalContentProps) {
  return (
    <section className="bg-cream px-4 py-12 pb-12 sm:px-6 md:pb-20">
      <div className="mx-auto max-w-3xl">
        {sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2
              className="font-heading text-xl font-bold text-primary lg:text-2xl"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-base leading-7 text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}
