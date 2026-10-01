import { headers } from "next/headers";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isFullBleed = pathname.startsWith("/register");

  if (isFullBleed) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        {children}
      </div>
    </main>
  );
}
