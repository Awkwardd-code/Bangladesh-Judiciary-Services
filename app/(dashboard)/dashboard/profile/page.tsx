import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ProfileClient } from "@/components/dashboard/profile-client";
import { getSessionFromCookies } from "@/lib/auth";
import { usersCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Profile — BJS Prep",
  description: "Manage your BJS Prep account details and preferences.",
};

export default async function ProfilePage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login?next=%2Fdashboard%2Fprofile");
  }

  const user = await (
    await usersCol()
  ).findOne({
    _id: new ObjectId(session.userId),
  });

  if (!user) {
    redirect("/login?next=%2Fdashboard%2Fprofile");
  }

  return (
    <ProfileClient
      user={{
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        roll: user.roll ?? null,
        university: user.university ?? null,
        studentId: user.studentId ?? null,
        phone: user.phone ?? null,
        avatarUrl: user.avatarUrl ?? null,
        avatarPublicId: user.avatarPublicId ?? null,
        verified: user.verified,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      }}
    />
  );
}
