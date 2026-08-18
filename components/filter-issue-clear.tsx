import { useFiltersContext } from "@/context/use-filters-context";
import { Button } from "@/components/ui/button";
import { useCookie } from "@/hooks/use-cookie";

const ClearFilters: React.FC = () => {
  const {
    issueTypes,
    setIssueTypes,
    assignees,
    setAssignees,
    epics,
    setEpics,
    search,
    setSearch,
    sprints,
    setSprints,
  } = useFiltersContext();
  const project = useCookie("project");
  const showAssignedTasks = project?.showAssignedTasks;
  const user = useCookie("user");
  const isAdminOrManager =
    user && (user.role === "admin" || user.role === "manager");

    function clearAllFilters() {
      setIssueTypes([]);
      setEpics([]);
      setSprints([]);
      setSearch("");
    
      if (isAdminOrManager || !showAssignedTasks) {
        setAssignees([]);
      }
    }
    

  // Admins/Managers: Show only if assignees.length >= 1
  if (
    isAdminOrManager &&
    assignees.length < 1 &&
    issueTypes.length === 0 &&
    epics.length === 0 &&
    sprints.length === 0 &&
    search === ""
  ) {
    return null;
  }

  // Regular users: Show only if showAssignedTasks is false
  if (
    !isAdminOrManager &&
    showAssignedTasks &&
    issueTypes.length === 0 &&
    epics.length === 0 &&
    sprints.length === 0 &&
    search === ""
  ) {
    return null;
  }

  return (
    <Button
      customColors
      onClick={clearAllFilters}
      className="px-4 text-sm hover:bg-gray-200 dark:bg-darkSprint-20 dark:text-dark-50 dark:hover:bg-darkSprint-30"
    >
      Clear Filters
    </Button>
  );
};

export { ClearFilters };
