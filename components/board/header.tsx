"use client";

import React from "react";
import { useFiltersContext } from "@/context/use-filters-context";
import { type Project } from "@prisma/client";
import { EpicFilter } from "@/components/filter-epic";
import { IssueTypeFilter } from "@/components/filter-issue-type";
import { SearchBar } from "@/components/filter-search-bar";
import { Members } from "../members";
import { ClearFilters } from "../filter-issue-clear";
import { SprintFilter } from "../filter-sprint";
import { HiOutlineViewColumns } from "react-icons/hi2";

const BoardHeader: React.FC<{
  project: Project;
  activeSprint: any;
  setChild: (v: boolean) => void;
  showChild: boolean;
}> = ({ project, activeSprint, setChild, showChild }) => {
  const { search, setSearch } = useFiltersContext();

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-600 font-medium">
        <span>Projects</span>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-400">{project.name}</span>
      </div>

      {/* Title row */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 dark:bg-brand-500/15">
          <HiOutlineViewColumns className="h-4 w-4 text-brand-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
            {activeSprint ? activeSprint.name : "Active Sprint"}
          </h1>
          {activeSprint?.description && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {activeSprint.description}
            </p>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar search={search} setSearch={setSearch} placeholder="Search board…" />
        <Members />
        <EpicFilter />
        <IssueTypeFilter />
        <SprintFilter />
        <ClearFilters />

        {/* Show child toggle */}
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-overlay-d px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-500 transition-all duration-150 select-none">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={showChild}
              onChange={() => setChild(!showChild)}
              name="showChild"
              className="form-checkbox h-3.5 w-3.5 rounded accent-brand-500 cursor-pointer"
            />
          </div>
          Show subtasks
        </label>
      </div>
    </div>
  );
};

export { BoardHeader };
