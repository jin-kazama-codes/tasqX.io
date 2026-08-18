"use client";

import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { timeStringToHours } from "@/utils/helpers";
import { useCookie } from "@/hooks/use-cookie";
import { HiOutlineChartBar, HiOutlineCalendar } from "react-icons/hi2";

const VelocityChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [sprintData, setSprintData] = useState([]);
  const [years, setYears] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [theme, setTheme] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const projectName = useCookie("project")?.name || "Project";

  const getQuarter = (date: Date) => Math.floor(date.getMonth() / 3) + 1;

  const fetchSprints = async () => {
    try {
      const response = await fetch("/api/sprints?closed=true");
      const data = await response.json();

      if (!data.sprints || data.sprints.length === 0) {
        setSprintData([]);
        return;
      }

      const sprintYearsSet = new Set<number>();
      const sprintQuartersMap: Record<number, Set<number>> = {};

      const processedSprints = data.sprints.map((sprint: any) => {
        const updatedAt = new Date(sprint.updatedAt);
        const year = updatedAt.getFullYear();
        const quarter = getQuarter(updatedAt);

        sprintYearsSet.add(year);

        if (!sprintQuartersMap[year]) {
          sprintQuartersMap[year] = new Set();
        }
        sprintQuartersMap[year].add(quarter);

        return {
          ...sprint,
          estimatedHours: timeStringToHours(sprint.estimateTime),
          actualHours: timeStringToHours(sprint.timeTaken),
          year,
          quarter,
        };
      });

      const sortedYears = [...sprintYearsSet].sort((a, b) => b - a);
      setYears(sortedYears as any);

      const latestYear = sortedYears[0];
      setSelectedYear(latestYear ? latestYear.toString() : "");

      if (latestYear) {
        const latestQuarters = [...sprintQuartersMap[latestYear]].sort((a, b) => b - a);
        setQuarters(latestQuarters as any);
        setSelectedQuarter(latestQuarters[0]?.toString() || "");
      }

      setSprintData(processedSprints);
    } catch (error) {
      console.error("Error fetching sprint data:", error);
    }
  };

  useEffect(() => {
    if (selectedYear && sprintData.length > 0) {
      const filteredQuarters = [
        ...new Set(
          sprintData
            .filter((sprint: any) => sprint.year.toString() === selectedYear)
            .map((sprint: any) => sprint.quarter)
        ),
      ].sort((a: any, b: any) => b - a);

      setQuarters(filteredQuarters as any);
      setSelectedQuarter(filteredQuarters[0]?.toString() || "");
    }
  }, [selectedYear, sprintData]);

  useEffect(() => {
    fetchSprints();

    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (sprintData.length === 0) return;

    const isDarkMode = theme === "dark";

    const filteredSprints = sprintData.filter((sprint: any) => {
      const matchYear = selectedYear ? sprint.year.toString() === selectedYear : true;
      const matchQuarter = selectedQuarter ? sprint.quarter.toString() === selectedQuarter : true;
      return matchYear && matchQuarter;
    });

    setChartOptions({
      chart: {
        type: "column",
        backgroundColor: "transparent",
        style: { fontFamily: "inherit" },
      },
      title: {
        text: `${projectName} Velocity — ${selectedYear} Q${selectedQuarter}`,
        style: {
          color: isDarkMode ? "#F1F5F9" : "#0F172A",
          fontSize: "15px",
          fontWeight: "700",
        },
      },
      xAxis: {
        categories: filteredSprints.map((sprint: any) => sprint.name),
        labels: { style: { color: isDarkMode ? "#94A3B8" : "#64748B" } },
        lineColor: isDarkMode ? "#334155" : "#E2E8F0",
      },
      yAxis: {
        title: {
          text: "Hours Logged",
          style: { color: isDarkMode ? "#94A3B8" : "#64748B" },
        },
        labels: { style: { color: isDarkMode ? "#94A3B8" : "#64748B" } },
        gridLineColor: isDarkMode ? "rgba(51, 65, 85, 0.4)" : "rgba(226, 232, 240, 0.8)",
      },
      legend: {
        enabled: true,
        itemStyle: { color: isDarkMode ? "#E2E8F0" : "#334155" },
      },
      series: [
        {
          name: "Estimated Time",
          color: isDarkMode ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 0.3)",
          borderColor: "#6366F1",
          borderRadius: 6,
          data: filteredSprints.map((sprint: any) => sprint.estimatedHours),
        },
        {
          name: "Actual Time Logged",
          color: "#10B981",
          borderRadius: 6,
          data: filteredSprints.map((sprint: any) => sprint.actualHours),
        },
      ],
      credits: { enabled: false },
    });
  }, [sprintData, selectedYear, selectedQuarter, theme]);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card p-6">
      {sprintData.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="h-4 w-4 text-slate-400" />
              <label htmlFor="year-select" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Year:
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="input-field text-xs font-semibold py-1 px-2.5 bg-white dark:bg-surface-overlay-d"
              >
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="quarter-select" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Quarter:
              </label>
              <select
                id="quarter-select"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="input-field text-xs font-semibold py-1 px-2.5 bg-white dark:bg-surface-overlay-d"
              >
                {quarters.map((quarter) => (
                  <option key={quarter} value={quarter.toString()}>
                    Q{quarter}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 mb-4 border border-emerald-500/20 shadow-xs">
            <HiOutlineChartBar className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Velocity Data Available
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Complete sprints with estimated and logged hours to generate sprint velocity comparisons and team capacity metrics.
          </p>
        </div>
      )}
    </div>
  );
};

export default VelocityChart;
