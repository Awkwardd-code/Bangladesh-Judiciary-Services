"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CourseDetailTabs({
  description,
  curriculum,
  instructor,
  routine,
}: {
  description: ReactNode;
  curriculum: ReactNode;
  instructor: ReactNode;
  routine: ReactNode;
}) {
  return (
    <Tabs defaultValue="description" className="min-w-0">
      <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1 sm:grid-cols-4">
        <TabsTrigger value="description">Overview</TabsTrigger>
        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        <TabsTrigger value="instructor">Mentors</TabsTrigger>
        <TabsTrigger value="routine">Schedule</TabsTrigger>
      </TabsList>
      <div className="mt-5">
        <TabsContent value="description">{description}</TabsContent>
        <TabsContent value="curriculum">{curriculum}</TabsContent>
        <TabsContent value="instructor">{instructor}</TabsContent>
        <TabsContent value="routine">{routine}</TabsContent>
      </div>
    </Tabs>
  );
}
