"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { useCookie } from "@/hooks/use-cookie";
import { useRouter } from "next/navigation";
import { setCookie } from "@/utils/helpers";
import withProjectLayout from "@/app/project-layout/withProjectLayout";
import {
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineDocumentDuplicate,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const UpdateProject: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    cloneChild: false,
    workingDays: 5,
    showAssignedTasks: false,
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const project = useCookie("project");
    const projectId = project?.id;
    const name = project?.name;
    const cloneChild = project?.cloneChild;
    const showAssignedTasks = project?.showAssignedTasks;
    const workingDays = parseInt(project?.workingDays, 10) || 5;
    if (projectId && name) {
      setFormData((prevData) => ({
        ...prevData,
        projectId,
        name,
        cloneChild: !!cloneChild,
        workingDays,
        showAssignedTasks: !!showAssignedTasks,
      }));
    } else {
      setError("Project not found in cookies");
    }
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "workingDays"
          ? parseInt(value, 10)
          : value,
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.patch("/api/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200 && isMounted) {
        const updatedProject = response.data.project;
        setCookie("project", {
          id: updatedProject.id,
          name: updatedProject.name,
          cloneChild: updatedProject.cloneChild,
          workingDays: updatedProject.workingDays,
          key: updatedProject.key,
          showAssignedTasks: updatedProject.showAssignedTasks,
        });
        setSuccess("Project settings saved successfully!");
      } else {
        setError(response.data.error || "Update failed");
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.error || "Update failed");
      } else {
        setError("An error occurred during the update");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
          <HiOutlineCog6Tooth className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Project Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure workspace preferences, rules, and workflow configuration
          </p>
        </div>
      </div>

      {/* Settings Form Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              Project Name
            </label>
            <div className="relative flex items-center">
              <HiOutlineDocumentText className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="name"
                name="name"
                type="text"
                style={{ paddingLeft: "2.75rem" }}
                className="input-field text-sm w-full py-2.5"
                placeholder="Enter project name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Working Days */}
          <div className="space-y-1.5">
            <label
              htmlFor="workingDays"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              Working Days per Week
            </label>
            <div className="relative flex items-center">
              <HiOutlineCalendarDays className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                id="workingDays"
                name="workingDays"
                style={{ paddingLeft: "2.75rem" }}
                className="input-field text-sm w-full py-2.5 bg-white dark:bg-surface-raised-d"
                value={formData.workingDays}
                onChange={handleChange}
              >
                <option value={5}>5 Days (Monday – Friday)</option>
                <option value={6}>6 Days (Monday – Saturday)</option>
                <option value={7}>7 Days (All Week)</option>
              </select>
            </div>
          </div>

          {/* Feature Preferences / Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-surface-border-d">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Preferences
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Clone Subtasks toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-surface-border-d bg-slate-50/50 dark:bg-surface-overlay-d/40 hover:bg-slate-50 dark:hover:bg-surface-overlay-d cursor-pointer transition-colors">
                <input
                  id="cloneChild"
                  name="cloneChild"
                  type="checkbox"
                  checked={formData.cloneChild}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-brand-500 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <HiOutlineDocumentDuplicate className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Clone Subtasks
                  </span>
                </div>
              </label>

              {/* Show assigned tasks toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-surface-border-d bg-slate-50/50 dark:bg-surface-overlay-d/40 hover:bg-slate-50 dark:hover:bg-surface-overlay-d cursor-pointer transition-colors">
                <input
                  id="showAssignedTasks"
                  name="showAssignedTasks"
                  type="checkbox"
                  checked={formData.showAssignedTasks}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-brand-500 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <HiOutlineUserGroup className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Show Assigned Only
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400 animate-fade-in">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <HiOutlineCheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-surface-border-d">
            <button
              type="button"
              onClick={() => router.push("/workflow")}
              className="btn-secondary w-full sm:w-auto py-2.5 px-4 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <span>View Workflow</span>
              <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full sm:flex-1 py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving changes…</span>
                </>
              ) : (
                <span>Save Project Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withProjectLayout(UpdateProject);
