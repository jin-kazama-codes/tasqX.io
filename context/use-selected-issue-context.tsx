"use client";

import { type IssueType } from "@/utils/types";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type SelectedIssueContextProps = {
  issueKey: IssueType["key"] | null;
  setIssueKey: React.Dispatch<React.SetStateAction<IssueType["key"] | null>>;
};

const SelectedIssueContext = createContext<SelectedIssueContextProps>({
  issueKey: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIssueKey: () => {},
});

export const SelectedIssueProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [issueKey, setIssueKey] = useState<IssueType["key"] | null>(null);

  // Sync state from URL query param only on initial load or back/forward
  useEffect(() => {
    const param = searchParams.get("selectedIssue");
    setIssueKey((prev) => (prev !== param ? param : prev));
  }, [searchParams]);

  const handleSetIssueKey: React.Dispatch<
    React.SetStateAction<IssueType["key"] | null>
  > = useCallback(
    (action) => {
      setIssueKey((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (next !== prev && typeof window !== "undefined") {
          const urlWithQuery =
            pathname + (next ? `?selectedIssue=${next}` : "");
          window.history.replaceState(null, "", urlWithQuery);
        }
        return next;
      });
    },
    [pathname]
  );

  return (
    <SelectedIssueContext.Provider
      value={{ issueKey, setIssueKey: handleSetIssueKey }}
    >
      {children}
    </SelectedIssueContext.Provider>
  );
};

export const useSelectedIssueContext = () => useContext(SelectedIssueContext);
