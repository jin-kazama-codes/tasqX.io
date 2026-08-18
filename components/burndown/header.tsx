"use client";

import React, { useEffect, useState } from "react";
import { type Project } from "@prisma/client";
import { HiOutlineFire, HiOutlineFlag } from "react-icons/hi2";

const BurndownHeader: React.FC<{
  project: Project;
  setSprintId: (id: string) => void;
  sprintId: string;
}> = ({ project, setSprintId, sprintId }) => {
  const [sprints, setSprints] = useState<any[] | null>(null);

  const fetchSprints = async () => {
    try {
      const response = await fetch("/api/sprints?closed=true");
      const data = await response.json();

      if (data.sprints && data.sprints.length > 0) {
        const sortedSprints = data.sprints.sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setSprints(sortedSprints);
        setSprintId(sortedSprints[0].id);
      } else {
        setSprints([]);
      }
    } catch (error) {
      console.error("Error fetching sprint data:", error);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
          <HiOutlineFire className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Burndown Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Projects / {project.name} / Burndown analytics
          </p>
        </div>
      </div>

      {sprints && sprints.length > 0 && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="sprint-select"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"
          >
            <HiOutlineFlag className="h-3.5 w-3.5" />
            <span>Sprint:</span>
          </label>
          <select
            id="sprint-select"
            value={sprintId || ""}
            onChange={(e) => setSprintId(e.target.value)}
            className="input-field text-xs font-semibold py-1.5 px-3 bg-white dark:bg-surface-raised-d"
          >
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export { BurndownHeader };
