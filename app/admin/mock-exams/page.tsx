import type { Metadata } from "next";

import { ExamsList } from "@/components/admin/exams-list";
import { WrittenExamsList } from "@/components/admin/written-exams-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Model Tests — Admin — BJS Prep",
  description: "Create and manage preliminary model tests.",
};

export default async function MockExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab === "written" ? "written" : "preliminary";

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Model Tests
          </h1>
          <p className="mt-2 text-base text-muted">
            Create and manage preliminary model tests.
          </p>
        </div>
      </header>
      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="preliminary">Preliminary</TabsTrigger>
          <TabsTrigger value="written">Written</TabsTrigger>
        </TabsList>
        <div className="mt-5">
          <TabsContent value="preliminary">
            <ExamsList />
          </TabsContent>
          <TabsContent value="written">
            <WrittenExamsList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
