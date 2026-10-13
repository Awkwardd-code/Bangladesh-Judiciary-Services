"use client";

import { useState } from "react";
import { GraduationCap, Landmark, Scale } from "lucide-react";

import { ProgramCard } from "@/components/sections/program-card";
import { PROGRAMS, type ProgramMeta } from "@/lib/program-meta";

const programIcons = {
  BJS: Scale,
  BAR: Landmark,
  LLB: GraduationCap,
} satisfies Record<ProgramMeta["code"], typeof Scale>;

export function ProgramStrip({ programs }: { programs: ProgramMeta[] }) {
  const [activeCode, setActiveCode] = useState<ProgramMeta["code"]>("BJS");
  const activeProgram =
    programs.find((program) => program.code === activeCode) ??
    programs[0] ??
    PROGRAMS[0];

  return (
    <section className="bg-background px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Choose your direction
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight text-primary lg:text-5xl">
            One platform.
            <span className="block text-accent">Three exam tracks.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Explore focused preparation for judicial service, bar enrollment,
            and law studies. Choose a track to see the learning path built for
            your goal.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div
            aria-label="Choose a program"
            className="inline-flex max-w-full rounded-full border border-border bg-card p-1 shadow-sm"
            role="tablist"
          >
            {programs.map((program) => {
              const Icon = programIcons[program.code];
              const isActive = program.code === activeCode;

              return (
                <button
                  key={program.code}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="home-program-panel"
                  onClick={() => setActiveCode(program.code)}
                  className={`
                    inline-flex cursor-pointer items-center gap-2 rounded-full
                    px-4 py-2.5 text-xs font-semibold transition-colors sm:px-6 sm:text-sm
                    ${
                      isActive
                        ? "bg-primary text-cream shadow-sm"
                        : "text-muted hover:text-foreground"
                    }
                  `}
                >
                  <Icon size={16} />
                  {program.code}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8" id="home-program-panel" role="tabpanel">
          <ProgramCard
            program={activeProgram}
            ctaHref={`/programs?code=${activeProgram.code}`}
            variant="strip"
          />
        </div>
      </div>
    </section>
  );
}
