import { ObjectId } from "mongodb";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSessionFromCookies } from "@/lib/auth";
import { usersCol } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionFromCookies();
  const user = session
    ? await (await usersCol()).findOne({
        _id: new ObjectId(session.userId),
      })
    : null;

  return (
    <>
      <SiteHeader
        initialUser={
          user
            ? {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: session?.role ?? "student",
                avatarUrl: user.avatarUrl ?? null,
              }
            : null
        }
      />
      {children}
      <SiteFooter />
    </>
  );
}
