import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ProfileClient } from "@/components/dashboard/profile-client";
import { requireAdmin } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Account settings — Admin — LegalPath Bangladesh",
  description: "Manage your administrator account and security settings.",
};

export default async function AdminProfilePage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/login?next=%2Fadmin%2Fprofile");
  }

  const user = await (await usersCol()).findOne({
    _id: new ObjectId(session.userId),
  });

  if (!user) {
    redirect("/login?next=%2Fadmin%2Fprofile");
  }

  return (
    <ProfileClient
      user={{
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: "admin",
        tier: user.tier,
        roll: user.roll ?? null,
        university: user.university ?? null,
        studentId: user.studentId ?? null,
        phone: user.phone ?? null,
        gender: user.gender ?? null,
        avatarUrl: user.avatarUrl ?? null,
        avatarPublicId: user.avatarPublicId ?? null,
        verified: user.verified,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      }}
    />
  );
}
