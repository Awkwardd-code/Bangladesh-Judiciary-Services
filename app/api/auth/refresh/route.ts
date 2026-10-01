import { fail, ok } from "@/lib/api-response";
import { AUTH_COOKIE_NAME, refreshSessionIfNeeded, setSessionCookie } from "@/lib/auth";
import { withGuard } from "@/lib/route-guard";

export const POST = withGuard({ kind: "session" }, async (req, { session }) => {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return fail("Not authenticated", 401);
  }

  const refreshedToken = await refreshSessionIfNeeded(token);

  if (refreshedToken) {
    await setSessionCookie(refreshedToken, session?.remember ?? true);
  }

  return ok({ refreshed: Boolean(refreshedToken) });
});