import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Root entry point. Sends signed-in users to the dashboard and everyone else
 * to login. The marketing/landing site (if any) lives outside this app.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? ROUTES.dashboard : ROUTES.login);
}
