import { useIssueDetails } from "@/hooks/query-hooks/use-issue-details";
import { type GetIssueCommentResponse } from "@/app/api/issues/[issueId]/comments/route";
import {
  Editor,
  type EditorContentType,
} from "@/components/text-editor/editor";
import { useKeydownListener } from "@/hooks/use-keydown-listener";
import { Fragment, useEffect, useRef, useState } from "react";
import { useIsInViewport } from "@/hooks/use-is-in-viewport";
import { type SerializedEditorState } from "lexical";
import { type IssueType } from "@/utils/types";
import { Avatar } from "@/components/avatar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { EditorPreview } from "@/components/text-editor/preview";
import { Button } from "@/components/ui/button";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { DefaultUser } from "@prisma/client";
import { useCookie } from "@/hooks/use-cookie";
import { CgAttachment } from "react-icons/cg";
import { MdDelete } from "react-icons/md";
dayjs.extend(relativeTime);

const Comments: React.FC<{ issue: IssueType }> = ({ issue }) => {
  const scrollRef = useRef(null);
  const [isWritingComment, setIsWritingComment] = useState(false);
  const [isInViewport, ref] = useIsInViewport();
  const { comments, commentsLoading, addComment } = useIssueDetails(issue?.id);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const user = useCookie("user");
  const [image, setImage] = useState<File[] | null>([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<String[] | null>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [scrollPos, setScrollPos] = useState(0);
  useEffect(() => {
    if (isWritingComment) {
      setScrollPos(window.scrollY); // Save current scroll position
    } else {
      window.scrollTo(0, scrollPos); // Restore scroll position
    }
  }, [isWritingComment]);

  // Handle paste event for clipboard images (Ctrl+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isWritingComment) return;

      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      const imageFiles: File[] = [];

      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            // Create a named file from the clipboard blob
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const extension = file.type.split("/")[1] || "png";
            const namedFile = new File([file], `screenshot-${timestamp}.${extension}`, {
              type: file.type,
            });
            imageFiles.push(namedFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault(); // Prevent default paste behavior for images

        const allFiles = [...(image || []), ...imageFiles];

        if (allFiles.length > 5) {
          alert("You can upload up to 5 files.");
          return;
        }

        setImage(allFiles);

        // Upload the pasted images
        const fakeEvent = { target: { files: imageFiles } } as unknown as React.ChangeEvent<HTMLInputElement>;
        await handleImageUpload(fakeEvent, imageFiles);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isWritingComment, image]);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    newFiles: File[]
  ) => {
    if (!newFiles || newFiles.length === 0) return;

    setUploading(true);
    const fileURLs: string[] = [];

    for (let file of newFiles) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("/api/attachment", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          fileURLs.push(data.fileUrl);
        } else {
          console.error("Upload failed:", data.error);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setUploading(false);

    // Append new URLs to existing ones
    setImageUrl((prev) => [...(prev || []), ...fileURLs]);
  };

  useKeydownListener(scrollRef, ["m", "M"], handleEdit);
  function handleEdit(ref: React.RefObject<HTMLElement>) {
    setIsWritingComment(true);
  }

  function handleSave(state: SerializedEditorState | undefined) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (imageUrl?.length === 0 && !state) {
      setIsWritingComment(false);
      return;
    }

    const stringifiedImageUrl = imageUrl?.join(", ");

    // Create the comment data object
    const commentData = {
      issueId: issue.id,
      content: JSON.stringify(state),
      authorId: user!.id,
      imageURL: stringifiedImageUrl,
    };

    addComment(commentData);
    setImage(null);
    setImageUrl([]);
    setIsWritingComment(false);
  }

  function handleDelete(index: number) {
    const updatedImages = [...image];
    updatedImages.splice(index, 1);

    const updatedImageUrls = [...imageUrl];
    updatedImageUrls.splice(index, 1);

    setImage(updatedImages);
    setImageUrl(updatedImageUrls);
  }

  function handleCancel() {
    setIsWritingComment(false);
  }
  if (commentsLoading) {
    return (
      <div className="mt-5 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-black dark:border-t-dark-0 dark:bg-darkSprint-30" />
      </div>
    );
  }

  return (
    <Fragment>
      <h2 className="dark:text-dark-50">Comments</h2>
      <div className="mb-5 w-full bg-white dark:bg-transparent">
        <div ref={scrollRef} id="dummy-scroll-div" />
        {isWritingComment ? (
          <div>
            {/* ✅ Show attached files ABOVE the editor */}
            {image && image.length > 0 && (
              <div className="mb-2">
                <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-dark-50">
                  Attached files
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {image.map((img, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="whitespace-nowrap font-mono text-sm dark:text-dark-50">
                        {img?.name}
                      </div>
                      <span
                        onClick={() => handleDelete(index)}
                        className="cursor-pointer"
                      >
                        <MdDelete className="text-lg text-red-600" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Editor
              action="comment"
              content={undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="">
            <AddComment
              user={user}
              onAddComment={() => handleEdit(scrollRef)}
              commentsInViewport={isInViewport}
            />
            <form encType="multipart/form-data" className="ml-10">
              <input
                type="file"
                onChange={(e) => {
                  e.preventDefault();
                  const selectedFiles = e.target.files
                    ? Array.from(e.target.files)
                    : [];

                  const allFiles = [...(image || []), ...selectedFiles];

                  if (allFiles.length > 5) {
                    alert("You can upload up to 5 files.");
                    return;
                  }

                  setImage(allFiles);
                  handleImageUpload(e, selectedFiles); // pass only new files to upload
                }}
                multiple
                accept="
    image/*,
    application/pdf,
    application/msword,
    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
    text/plain,
    application/vnd.ms-excel,
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  "
                ref={fileInputRef}
                style={{ display: "none" }}
              />

              <div className="">
                {uploading && !image ? (
                  <div className="loader"></div>
                ) : (
                  <Button
                    type="button"
                    customColors
                    className="flex gap-2 whitespace-nowrap rounded-lg  hover:bg-gray-100 dark:hover:bg-darkSprint-20"
                    onClick={handleButtonClick} // Handle button click
                  >
                    <CgAttachment className="rotate-45 text-xl dark:text-dark-50" />
                    <span className=" dark:text-white">Attach</span>
                  </Button>
                )}
                {image && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {image.map((img, index) => (
                      <div key={index} className="flex items-center gap-2 ">
                        <div className="whitespace-nowrap font-mono text-sm dark:text-dark-50">
                          {img?.name}{" "}
                        </div>
                        <span
                          onClick={() => handleDelete(index)}
                          className="cursor-pointer"
                        >
                          <MdDelete className="text-lg text-red-600" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
      <div ref={ref} className="flex flex-col gap-y-5 pb-5">
        {comments?.map((comment) => (
          <CommentPreview key={comment.id} comment={comment} user={user} />
        ))}
      </div>
    </Fragment>
  );
};

const CommentPreview: React.FC<{
  comment: GetIssueCommentResponse["comment"];
  user: DefaultUser | undefined | null;
}> = ({ comment, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const { updateComment, deleteComment } = useIssueDetails(comment.issueId);
  const [updatedComment, setUpdatedComment] = useState(comment);

  useEffect(() => {
    setUpdatedComment(comment);
  }, [comment]);

  function handleSave(state: SerializedEditorState | undefined) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    updateComment({
      issueId: comment.issueId,
      commentId: comment.id,
      content: JSON.stringify(state),
    });
    setIsEditing(false);
  }

  function handleDelete() {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    // Call deleteComment from useIssueDetails hook
    deleteComment.mutate({
      issueId: comment.issueId,
      commentId: comment.id,
    });
  }

  return (
    <div className="flex w-full gap-x-2  rounded-xl bg-transparent px-2 pt-2 dark:bg-gray-300">
      <Avatar
        src={comment.author?.avatar ?? ""}
        alt={`${comment.author?.name ?? "Guest"}`}
      />
      <div className="w-full rounded-xl  p-2 px-3">
        <div className="flex items-center gap-x-3 text-xs">
          <span className="font-bold text-black ">{comment.author?.name}</span>
          <span className="text-gray-800 dark:text-darkSprint-0">
            {dayjs(comment.createdAt).fromNow()}
          </span>

          <span
            data-state={comment.isEdited ? "edited" : "not-edited"}
            className="hidden text-gray-700 [&[data-state=edited]]:block"
          >
            (Edited)
          </span>
        </div>
        {isEditing ? (
          <Editor
            action="comment"
            content={
              updatedComment.content
                ? (JSON.parse(updatedComment.content) as EditorContentType)
                : undefined
            }
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            className="mt-2"
          />
        ) : (
          <EditorPreview
            key={updatedComment.id}
            className="!text-dark-50"
            action="comment"
            content={
              updatedComment.content
                ? (JSON.parse(updatedComment.content) as EditorContentType)
                : undefined
            }
            imageURL={comment.imageURL}
          />
        )}
        {comment.authorId == user?.id ? (
          <div className="">
            <Button
              onClick={() => setIsEditing(true)}
              customColors
              className="bg-transparent text-xs font-medium text-gray-800 underline-offset-2 hover:underline"
            >
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              customColors
              className="bg-transparent text-xs font-medium text-gray-800 underline-offset-2 hover:underline"
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const AddComment: React.FC<{
  onAddComment: () => void;
  user: DefaultUser | undefined | null;
  commentsInViewport: boolean;
}> = ({ onAddComment, user, commentsInViewport }) => {
  function handleAddComment(event: React.MouseEvent<HTMLInputElement>) {
    event.preventDefault();
    onAddComment();
  }
  return (
    <div
      data-state={commentsInViewport ? "inViewport" : "notInViewport"}
      className="flex w-full gap-x-2  border-transparent py-3 [&[data-state=notInViewport]]:border-gray-200"
    >
      <div className="mt-2">
        <Avatar src={user?.avatar} alt={user ? user.name : "Guest"} />
      </div>
      <div className="w-11/12">
        <label htmlFor="add-comment" className="sr-only">
          Add Comment
        </label>
        <input
          onMouseDown={handleAddComment}
          type="text"
          id="add-comment"
          placeholder="Add a comment..."
          className="w-full rounded-xl border border-gray-300 px-4 py-2 placeholder:text-sm"
        />
        {/* <p className="my-2 text-xs text-gray-500">
          <span className="font-bold">Pro tip:</span>
          <span> press </span>
          <span className="rounded-full bg-gray-300 px-1 py-0.5 font-bold">
            M
          </span>
          <span> to comment </span>
        </p> */}
      </div>
    </div>
  );
};

export { Comments };
