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
      <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="curriculum">Course Content</TabsTrigger>
        <TabsTrigger value="instructor">Instructor</TabsTrigger>
        <TabsTrigger value="routine">Routine</TabsTrigger>
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
