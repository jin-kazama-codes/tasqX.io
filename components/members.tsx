import { useFiltersContext } from "@/context/use-filters-context";
import { useMembers } from "@/hooks/query-hooks/use-members";
import { Button } from "./ui/button";
import { Avatar } from "./avatar";
import { UserModal } from "./modals/add-people/index";
import { AddPeopleIcon } from "./svgs";
import { useCookie } from "@/hooks/use-cookie";
import { TooltipWrapper } from "./ui/tooltip";
import { useEffect } from "react";

const colorPalette = [
  "#4A9D8E",
  "#6A9AB8",
  "#8F7BAE",
  "#D5A8A1",
  "#C28C86",
  "#A0C9C4",
  "#6BB9A6",
  "#9BBF98",
  "#8E94C7",
  "#C18B91",
  "#7A8F97",
  "#B19EB1",
  "#6D9DC5",
  "#A8C9A6",
  "#89A9B4",
];

const Members = () => {
  const { members, refetch } = useMembers();
  const { assignees, setAssignees } = useFiltersContext();
  const unassigned = {
    id: "unassigned",
    name: "Unassigned",
    avatar: undefined,
    email: "",
  };
  const user = useCookie("user");
  const project = useCookie("project");
  const showAssignedTasks = project?.showAssignedTasks;
  const isAdminOrManager =
    user && (user.role === "admin" || user.role === "manager");

  useEffect(() => {
    if (showAssignedTasks && !isAdminOrManager && user?.id) {
      setAssignees(assignees.length === 0 ? [user.id] : []);
    }
  }, [showAssignedTasks]);

  function handleAssigneeFilter(id: string) {
    if (showAssignedTasks && !isAdminOrManager) return;
    setAssignees((prev) => {
      if (prev.includes(id)) return prev.filter((a) => a !== id);
      return [...prev, id];
    });
  }

  function getInitials(name: string) {
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part.charAt(0)).join("");
    return initials.toUpperCase();
  }

  function getColorForInitial(memberId: number, index: number) {
    const savedColorMap = JSON.parse(localStorage.getItem("colorMap")) || {};

    if (savedColorMap[memberId]) {
      return savedColorMap[memberId];
    }

    const newColor = colorPalette[index % colorPalette.length];

    const updatedColorMap = { ...savedColorMap, [memberId]: newColor };
    localStorage.setItem("colorMap", JSON.stringify(updatedColorMap));

    return newColor;
  }

  if (!members) return <div />;

  const totalMembers = members.length + 1; // Including unassigned
  const needsScroll = totalMembers > 7;

  return (
    <div className="flex items-center  bg-transparent">
      <div className="relative bg-transparent">
        {/* Subtle fade effects */}
        {/* <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-white to-transparent opacity-90" /> */}
        {needsScroll && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-transparent to-transparent opacity-90" />
        )}

        {/* Scrollable container with subtle shadow */}
        <div
          className={`${
            needsScroll
              ? "w-56 overflow-x-auto [-ms-scrollbar:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : ""
          } rounded-xl  py-2`}
        >
          <div className={`flex ${needsScroll ? "px-3" : ""}`}>
            {[...members, unassigned].map((member, index) => {
              const initials = getInitials(member.name);
              const bgColor = getColorForInitial(member.id, index);
              return (
                <div
                  key={member.id}
                  style={{ zIndex: members.length - index }}
                  className="-ml-2  first:ml-0 hover:!z-10"
                >
                  <Button
                    onClick={() => handleAssigneeFilter(member.id)}
                    customColors
                    customPadding
                    data-state={
                      assignees.includes(member.id)
                        ? "selected"
                        : "not-selected"
                    }
                    className="flex border-spacing-2 rounded-full border-2 border-transparent bg-white p-0.5 transition-all duration-75 hover:-mt-1.5 dark:bg-darkSprint-20 [&[data-state=selected]]:border-inprogress"
                  >
                    {member.avatar ? (
                      <Avatar src={member.avatar} alt={`${member.name}`} />
                    ) : (
                      <TooltipWrapper text={member.name}>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300"
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="font-bold text-white">
                            {initials}
                          </span>
                        </div>
                      </TooltipWrapper>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(user?.role === "admin" || user?.role === "manager") && (
        <UserModal refetch={refetch}>
          <button>
            <AddPeopleIcon
              className="ml-3 rounded-full bg-gray-200 p-1 text-gray-500 dark:bg-darkSprint-20 dark:text-dark-50"
              size={35}
            />
          </button>
        </UserModal>
      )}
    </div>
  );
};

export { Members };
