"use client";

import React, { ReactNode, useEffect, useState } from "react";
import DocumentUpload from "@/components/modals/documentUpload";
import CreateFolderButton from "./createFolder";
import { useDocuments } from "@/hooks/query-hooks/use-documents";
import { useCookie } from "@/hooks/use-cookie";
import DeleteDocument from "@/components/modals/deleteDocument";
import { DocumentSkeleton } from "../skeletons";
import {
  HiOutlineFolder,
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineArrowDownTray,
  HiOutlineChevronRight,
  HiOutlineFolderPlus,
} from "react-icons/hi2";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import clsx from "clsx";

interface FileItem {
  link: string;
  DefaultUser?: { name: string; avatar?: string };
  createdAt: string;
  id: string;
  name: string;
  extensions: "pdf" | "image" | "document" | string;
  type: string;
  parentId?: string | null;
  ownerId: number;
}

const Document: React.FC = () => {
  const user = useCookie("user");
  const userId = user?.id;

  const FileIcon = ({ extensions }: { extensions: string }) => {
    switch (extensions) {
      case "pdf":
        return <HiOutlineDocumentText className="h-5 w-5 text-rose-500" />;
      case "image":
        return <HiOutlinePhoto className="h-5 w-5 text-violet-500" />;
      default:
        return <HiOutlineDocumentText className="h-5 w-5 text-brand-500" />;
    }
  };

  const [parentId, setParentId] = useState<string | null>(null);
  const {
    documents: allFiles,
    isLoading,
    error,
    refetch,
  } = useDocuments(parentId);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [pathStack, setPathStack] = useState<FileItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FileItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (allFiles) {
      const sortedFiles = (allFiles as any[]).slice().sort((a, b) => {
        const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return createdAtDiff !== 0 ? createdAtDiff : a.name.localeCompare(b.name);
      });

      setFolders(sortedFiles.filter((file) => file.type !== "file"));
      setFiles(sortedFiles.filter((file) => file.type === "file"));
    }
  }, [allFiles]);

  const handleFolderClick = (folder: FileItem) => {
    setParentId(folder.id);
    setSelectedFolder(folder);
    setPathStack((prev) => [...prev, folder]);
    setCurrentPage(1);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setSelectedFolder(null);
      setParentId(null);
      setPathStack([]);
    } else {
      setSelectedFolder(pathStack[index]);
      const newStack = pathStack.slice(0, index + 1);
      setPathStack(newStack);
      setParentId(newStack[newStack.length - 1]?.id || null);
    }
    setCurrentPage(1);
  };

  const displayedFiles = selectedFolder
    ? files.filter((file) => file.parentId === selectedFolder.id)
    : files.filter((file) => file.parentId === null);

  const displayedFolders = selectedFolder
    ? folders.filter((folder) => folder.parentId === selectedFolder.id)
    : folders.filter((folder) => folder.parentId === null);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(displayedFiles.length / itemsPerPage);
  const paginatedFiles = displayedFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <DocumentSkeleton />;
  if (error) return <div className="p-6 text-red-500">Error: {(error as any).message}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
            <HiOutlineFolder className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Documents & Assets
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage project files, specs, and design attachments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <CreateFolderButton
            onFolderCreated={refetch}
            selectedFolderId={selectedFolder?.id}
          />
          <DocumentUpload
            onUploadComplete={refetch}
            selectedFolderId={selectedFolder?.id}
          >
            <button className="btn-brand py-2.5 px-4 text-xs inline-flex items-center gap-1.5">
              <HiOutlinePlus className="h-4 w-4" />
              <span>Add File</span>
            </button>
          </DocumentUpload>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <button
          onClick={() => handleBreadcrumbClick(-1)}
          className={clsx(
            "rounded-lg px-2 py-1 transition-colors hover:text-slate-900 dark:hover:text-slate-100",
            !selectedFolder && "bg-slate-100 dark:bg-surface-overlay-d font-bold text-slate-900 dark:text-slate-100"
          )}
        >
          Root Documents
        </button>
        {pathStack.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <HiOutlineChevronRight className="h-3 w-3 text-slate-400" />
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={clsx(
                "rounded-lg px-2 py-1 transition-colors hover:text-slate-900 dark:hover:text-slate-100",
                index === pathStack.length - 1 &&
                  "bg-slate-100 dark:bg-surface-overlay-d font-bold text-slate-900 dark:text-slate-100"
              )}
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Folders Grid (if any folders in current directory) */}
      {displayedFolders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Folders ({displayedFolders.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {displayedFolders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => handleFolderClick(folder)}
                className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-card cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <HiOutlineFolder className="h-5 w-5 text-brand-500 shrink-0" />
                  <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                    {folder.name}
                  </span>
                </div>
                {Number(userId) === Number(folder.ownerId) && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <DeleteDocument Id={folder.id} folder={true}>
                      <button
                        title="Delete folder"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    </DeleteDocument>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Table Card */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Files ({displayedFiles.length})
        </h3>
        <div className="rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card overflow-hidden">
          {displayedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 gap-2">
              <HiOutlineDocumentText className="h-10 w-10 text-slate-300 dark:text-surface-border-d" />
              <p className="text-xs font-medium">No files uploaded in this folder.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-100 dark:border-surface-border-d bg-slate-50/80 dark:bg-surface-overlay-d/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">
                        File Name
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        Uploaded By
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        Date Added
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-surface-border-d">
                    {paginatedFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-surface-overlay-d/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <FileIcon extensions={file.extensions} />
                            <a
                              href={file.link}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition-colors"
                            >
                              {file.name}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                          {file.DefaultUser?.name ?? "Team Member"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 dark:text-slate-500 text-xs">
                          {new Date(file.createdAt).toLocaleDateString()}{" "}
                          {new Date(file.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={file.link}
                              target="_blank"
                              rel="noreferrer"
                              download
                              title="Download file"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-surface-overlay-d dark:hover:text-slate-200 transition-colors"
                            >
                              <HiOutlineArrowDownTray className="h-4 w-4" />
                            </a>
                            {Number(userId) === Number(file.ownerId) && (
                              <DeleteDocument Id={file.id} folder={false}>
                                <button
                                  title="Delete file"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                                >
                                  <HiOutlineTrash className="h-4 w-4" />
                                </button>
                              </DeleteDocument>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-surface-border-d px-6 py-3 bg-slate-50/50 dark:bg-surface-overlay-d/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Showing page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-overlay-d disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-overlay-d disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Document;
