import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, MessageSquare, FolderOpen } from "lucide-react";
import { NewProjectModal } from "@/components/app/NewProjectModal";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(projects.updatedAt);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Each project has its own memory, files, and conversation history.
            </p>
          </div>
          <NewProjectModal userId={userId} />
        </div>

        {userProjects.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border border-dashed border-white/10">
            <FolderOpen className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-sm text-zinc-600 mb-6">
              Create a project to organize your conversations and memory.
            </p>
            <NewProjectModal userId={userId} label="Create First Project" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/chat/${proj.id}`}
                className="glass rounded-xl p-5 hover:border-white/10 transition-all hover:bg-white/2 group flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{proj.emoji}</span>
                  <div
                    className="w-2 h-2 rounded-full mt-1"
                    style={{ background: proj.color }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                    {proj.name}
                  </h3>
                  {proj.description && (
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                      {proj.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-auto text-xs text-zinc-700">
                  <MessageSquare className="w-3 h-3" />
                  <span>Open chat →</span>
                </div>
              </Link>
            ))}

            {/* New project card */}
            <NewProjectModal userId={userId} asCard />
          </div>
        )}
      </div>
    </div>
  );
}
