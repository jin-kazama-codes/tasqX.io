"use client";

import { removeCookie, setCookie } from "@/utils/helpers";
import { Project } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "../toast";
import { useCookie } from "@/hooks/use-cookie";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineRectangleStack,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

interface ProjectListProps {
  projects: Project[];
  admin: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, admin }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = useCookie("Invited Project");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(false);

  const PER_PAGE = 6;

  useEffect(() => {
    queryClient.removeQueries();
  }, []);

  const invitedProject = projects.find((p) => p.id === projectId);

  const handleProjectClick = (project: Project) => {
    setCookie("project", project);
    router.push(`/${project.key}/backlog`);
  };

  useEffect(() => {
    router.refresh();
    if (invitedProject) handleProjectClick(invitedProject);
    removeCookie("Invited Project");
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filtered = [...projects]
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const handleDelete = async (projectId: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/project/${projectId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data);
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(data);
      }
    } catch {
      toast.error({ message: "Something went wrong!", description: "Error deleting project." });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  /* helper to pick a consistent color per project */
  function projectColor(key: string) {
    const palette = [
      "bg-brand-500",
      "bg-accent-violet",
      "bg-accent-teal",
      "bg-accent-rose",
      "bg-accent-amber",
      "bg-accent-cyan",
    ];
    const idx = key.charCodeAt(0) % palette.length;
    return palette[idx];
  }

  return (
    <>
      <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d overflow-hidden shadow-card dark:shadow-card-dark">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-surface-border-d bg-slate-50 dark:bg-surface-overlay-d px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Projects
            </h2>
            <span className="rounded-full bg-brand-50 dark:bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>
        </div>

        {/* Project grid */}
        <div className="flex-1 p-4">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
              <HiOutlineRectangleStack className="h-10 w-10" />
              <p className="text-sm font-medium">No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {paginated.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className={clsx(
                    "issue-card group relative flex flex-col gap-3 p-4 overflow-hidden",
                    "cursor-pointer"
                  )}
                >
                  {/* Color accent */}
                  <div
                    className={clsx(
                      "absolute inset-y-0 left-0 w-1 rounded-l-xl",
                      projectColor(project.key)
                    )}
                  />

                  {/* Project key badge */}
                  <div className="flex items-center justify-between pl-1">
                    <span
                      className={clsx(
                        "inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-extrabold shadow-2xs",
                        project.imageUrl
                          ? "bg-slate-100 dark:bg-surface-overlay-d border border-slate-200 dark:border-surface-border-d"
                          : clsx(projectColor(project.key), "text-white text-[10px]")
                      )}
                    >
                      {project.imageUrl ? project.imageUrl : project.key.slice(0, 2).toUpperCase()}
                    </span>
                    {admin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setShowDeleteDialog(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all duration-150"
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="pl-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      {project.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider mt-0.5">
                      {project.key}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 border-t border-slate-200 dark:border-surface-border-d px-4 py-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="btn-ghost h-8 w-8 p-0 disabled:opacity-30"
            >
              <HiChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={clsx(
                  "h-8 w-8 rounded-lg text-sm font-medium transition-all duration-150",
                  n === currentPage
                    ? "bg-brand-500 text-white shadow-glow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-overlay-d"
                )}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-ghost h-8 w-8 p-0 disabled:opacity-30"
            >
              <HiChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-raised-d shadow-modal border border-slate-200 dark:border-surface-border-d overflow-hidden animate-scale-in">
            <div className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <HiOutlineExclamationTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Delete project?
                </h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {projectToDelete.name}
                  </span>{" "}
                  will be permanently deleted. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 bg-slate-50 dark:bg-surface-overlay-d px-6 py-4 border-t border-slate-200 dark:border-surface-border-d">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(projectToDelete.id)}
                disabled={deleting}
                className="btn-brand bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-none hover:shadow-none"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectList;