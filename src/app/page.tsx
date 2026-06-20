import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Root route — server component.
 * • Authenticated users → /dashboard
 * • Everyone else → landing page
 */
export default async function RootPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const { default: LandingPage } = await import(
    "@/components/landing/LandingPage"
  );
  return <LandingPage />;
}