import { Card } from "@/components/ui/card";

export default function ProgramsLoading() {
  return (
    <main>
      <section className="bg-cream px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto h-4 w-24 animate-pulse rounded bg-border" />
          <div className="mx-auto mt-5 h-12 max-w-lg animate-pulse rounded bg-border" />
          <div className="mx-auto mt-3 h-12 max-w-md animate-pulse rounded bg-border" />
          <div className="mx-auto mt-6 h-14 max-w-2xl animate-pulse rounded bg-border" />
        </div>
      </section>

      <section className="bg-cream px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-11 w-28 animate-pulse rounded-full bg-border"
              />
            ))}
          </div>

          <Card
            className="
              mt-10 grid overflow-hidden rounded-xl border border-border
              bg-card p-0 shadow-sm lg:grid-cols-12
            "
          >
            <div className="space-y-6 p-8 lg:col-span-7 lg:p-10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-border" />
                <div className="space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded bg-border" />
                  <div className="h-7 w-52 animate-pulse rounded bg-border" />
                </div>
              </div>
              <div className="h-16 animate-pulse rounded bg-border" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }, (_, item) => (
                  <div
                    key={item}
                    className="h-10 animate-pulse rounded-md bg-border"
                  />
                ))}
              </div>
              <div className="h-12 w-44 animate-pulse rounded-full bg-border" />
            </div>

            <div className="space-y-6 bg-primary p-8 lg:col-span-5 lg:p-10">
              <div className="h-4 w-28 animate-pulse rounded bg-cream/20" />
              {Array.from({ length: 5 }, (_, item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-cream/20" />
                  <div className="h-5 w-40 animate-pulse rounded bg-cream/20" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
