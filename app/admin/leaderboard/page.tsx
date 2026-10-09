import type { Metadata } from "next";

import { LeaderboardClient } from "@/components/admin/leaderboard-client";
import {
  listLeaderboard,
  listLeaderboardExamOptions,
} from "@/lib/leaderboard-query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard — Admin — BJS Prep",
};

export default async function LeaderboardPage() {
  const [rows, examOptions] = await Promise.all([
    listLeaderboard({}),
    listLeaderboardExamOptions(),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <LeaderboardClient initialRows={rows} examOptions={examOptions} />
    </div>
  );
}
