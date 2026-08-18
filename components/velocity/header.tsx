"use client";

import React from "react";
import { type Project } from "@prisma/client";
import { HiOutlineChartBar } from "react-icons/hi2";

const VelocityHeader: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
        <HiOutlineChartBar className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Velocity Report
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Projects / {project.name} / Velocity & throughput tracking
        </p>
      </div>
    </div>
  );
};

export { VelocityHeader };
