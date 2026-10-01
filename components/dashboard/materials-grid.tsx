import Link from "next/link";
import { FileText, FolderOpen, Link as LinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const materials = [
  { id: "m1", title: "Criminal Procedure Code — Annotated Notes", category: "Criminal Law", format: "PDF", sizeOrType: "2.4 MB", uploadedAt: "20 Sep 2026" },
  { id: "m2", title: "Penal Code Section-wise Summary", category: "Criminal Law", format: "PDF", sizeOrType: "1.8 MB", uploadedAt: "18 Sep 2026" },
  { id: "m3", title: "Civil Procedure Code — Flowcharts", category: "Civil Law", format: "PDF", sizeOrType: "3.1 MB", uploadedAt: "15 Sep 2026" },
  { id: "m4", title: "Evidence Act — Landmark Cases", category: "Evidence", format: "PDF", sizeOrType: "2.0 MB", uploadedAt: "12 Sep 2026" },
  { id: "m5", title: "Constitutional Law — Key Amendments", category: "Constitutional Law", format: "PDF", sizeOrType: "1.2 MB", uploadedAt: "10 Sep 2026" },
  { id: "m6", title: "BJS Syllabus 2026", category: "Reference", format: "PDF", sizeOrType: "0.6 MB", uploadedAt: "05 Sep 2026" },
  { id: "m7", title: "Recommended Reading List", category: "Reference", format: "DOC", sizeOrType: "0.2 MB", uploadedAt: "01 Sep 2026" },
  { id: "m8", title: "Supreme Court Judgment Database", category: "Reference", format: "Link", sizeOrType: "External", uploadedAt: "28 Aug 2026" },
];

export function MaterialsGrid() {
  return (
    <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {materials.length > 0 ? materials.map((material) => <MaterialCard key={material.id} material={material} />) : <EmptyMaterials />}
    </section>
  );
}

function MaterialCard({ material }: { material: (typeof materials)[number] }) {
  const Icon = material.format === "Link" ? LinkIcon : FileText;
  return (
    <Card className="flex flex-col border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between"><Icon size={24} className="text-accent" /><Badge className="border-border text-xs text-muted">{material.format}</Badge></div>
      <h2 className="mt-4 line-clamp-2 font-heading text-base font-semibold text-primary">{material.title}</h2>
      <p className="mt-2 text-xs text-muted">{material.category} · {material.sizeOrType}</p>
      <div className="mt-6 flex items-center justify-between"><span className="text-xs text-muted">Uploaded {material.uploadedAt}</span><Link href="#" className="text-sm text-accent hover:underline">Download →</Link></div>
    </Card>
  );
}

function EmptyMaterials() {
  return <Card className="p-12 text-center sm:col-span-2 lg:col-span-3"><FolderOpen className="mx-auto text-muted" size={48} /><h2 className="mt-4 text-base font-medium text-primary">No materials yet.</h2><p className="mt-1 text-sm text-muted">Reading materials will appear here once uploaded.</p></Card>;
}
