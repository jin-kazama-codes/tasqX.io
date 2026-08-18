"use client";

import React from "react";
import { useCookie } from "@/hooks/use-cookie";
import { VelocityHeader } from "./header";
import VelocityChart from "./chart";

const Velocity: React.FC = () => {
  const project = useCookie("project");

  if (!project) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <VelocityHeader project={project} />
      <VelocityChart />
    </div>
  );
};

export { Velocity };
