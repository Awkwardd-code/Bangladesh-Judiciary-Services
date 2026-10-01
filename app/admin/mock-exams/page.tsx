import type { Metadata } from "next";

import { ExamsList } from "@/components/admin/exams-list";
import { WrittenExamsList } from "@/components/admin/written-exams-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Mock Exams — Admin — BJS Prep",
  description: "Create and manage preliminary mock tests.",
};

export default function MockExamsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Mock Exams
          </h1>
          <p className="mt-2 text-base text-muted">
            Create and manage preliminary mock tests.
          </p>
        </div>
      </header>
      <Tabs defaultValue="preliminary">
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
