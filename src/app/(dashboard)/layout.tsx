import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { aiAccounts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/components/app/AppSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  // Fetch real accounts and projects for sidebar
  const [accounts, userProjects] = await Promise.all([
    db.select().from(aiAccounts).where(eq(aiAccounts.userId, userId)),
    db.select().from(projects).where(eq(projects.userId, userId)),
  ]);

  return (
    <div className="app-shell flex h-screen overflow-hidden" style={{ background: "#080808" }}>
      <AppSidebar
        user={session.user}
        accounts={accounts}
        projects={userProjects}
      />
      <main className="app-main flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
