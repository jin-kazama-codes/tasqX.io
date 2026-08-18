import CreateProject from "./create/page";
import { type Project } from "@prisma/client";
import { parsePageCookies } from "@/utils/cookies";
import ProjectList from "@/components/project/project-list";
import { prisma } from "@/server/db";
import { HiOutlineSquares2X2 } from "react-icons/hi2";

const Project: React.FC = async () => {
  const user = parsePageCookies("user");
  const companyId = user?.companyId;
  const isAdminOrManager =
    user && (user.role === "admin" || user.role === "manager");

  // Single query to get both member and project data
  const projects = await prisma.project.findMany({
    where: {
      companyId, // Ensure projects belong to the user's company
      ...(isAdminOrManager ? {} : { members: { some: { id: user.id } } }),
    },
    include: { members: true },
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-surface-base-d py-10 px-4 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-accent-violet/5 dark:bg-accent-violet/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Projects & Workspaces
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select a project to view its active sprint, Kanban board, and backlog
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div
          className={`grid gap-8 items-start ${
            isAdminOrManager ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
          }`}
        >
          {/* Left: Project List */}
          <div
            className={
              isAdminOrManager
                ? "lg:col-span-7"
                : "mx-auto max-w-3xl w-full"
            }
          >
            {projects ? (
              <ProjectList projects={projects} admin={isAdminOrManager} />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-400 dark:border-surface-border-d dark:bg-surface-raised-d">
                Loading workspaces…
              </div>
            )}
          </div>

          {/* Right: Create Project Form */}
          {isAdminOrManager && (
            <div className="lg:col-span-5 sticky top-24">
              <CreateProject />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;