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
import { HiOutlineMap } from "react-icons/hi2";

const RoadmapHeader: React.FC<{ project: Project }> = ({ project }) => {
  const { search, setSearch } = useFiltersContext();
  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Title section */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-xs">
          <HiOutlineMap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Roadmap & Epics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Projects / {project.name} / Epic milestones and feature initiatives
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          search={search}
          setSearch={setSearch}
          placeholder="Search epics and initiatives…"
        />
        <Members />
        <EpicFilter />
        <IssueTypeFilter />
        <SprintFilter />
        <ClearFilters />
      </div>
    </div>
  );
};

export { RoadmapHeader };
