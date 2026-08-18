import { Editor } from "@/components/text-editor/editor";
import { type SerializedEditorState } from "lexical";
import { EditorPreview } from "@/components/text-editor/preview";
import { useState } from "react";
import { type IssueType } from "@/utils/types";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { useIsAuthenticated } from "@/hooks/use-is-authed";

function parseDescriptionContent(
  desc: string | null | undefined
): SerializedEditorState | undefined {
  if (!desc) return undefined;

  try {
    const parsed = JSON.parse(desc);
    if (parsed && typeof parsed === "object" && parsed.root) {
      return parsed as SerializedEditorState;
    }
  } catch {
    // Description is plain text, convert to Lexical state
  }

  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: desc,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as unknown as SerializedEditorState;
}

const Description: React.FC<{ issue: IssueType }> = ({ issue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateIssue } = useIssues(issue.sprintId);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  const [content, setContent] = useState<SerializedEditorState | undefined>(
    parseDescriptionContent(issue.description)
  );

  function handleEdit(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    setIsEditing(true);
  }

  function handleSave(state: SerializedEditorState | undefined) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setContent(state);
    updateIssue({
      issueId: issue.id,
      description: state ? JSON.stringify(state) : undefined,
    });
    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  return (
    <div className="bg-slate-50 dark:bg-surface-overlay-d/60 border border-slate-200/80 dark:border-surface-border-d py-3 px-4 mt-3 rounded-2xl">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Description
      </h2>
      <div>
        {isEditing ? (
          <Editor
            action="description"
            content={content}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div onMouseDown={handleEdit} className="cursor-pointer">
            <EditorPreview
              action="description"
              content={content}
              className="rounded-xl p-2 transition-all duration-150 hover:bg-slate-100 dark:hover:bg-surface-raised-d text-slate-800 dark:text-slate-200 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { Description };
