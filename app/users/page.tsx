"use client";

import { DeleteUserModal } from "@/components/modals/default-users/delete-user";
import { EditUserModal } from "@/components/modals/default-users/edit-user";
import { useMembers } from "@/hooks/query-hooks/use-members";
import withProjectLayout from "@/app/project-layout/withProjectLayout";
import React, { useState, useEffect } from "react";
import { UserModal } from "@/components/modals/add-people";
import { Avatar } from "@/components/avatar";
import {
  HiOutlineUsers,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineUser,
} from "react-icons/hi2";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import clsx from "clsx";

const Userspage = () => {
  const { members, refetch } = useMembers();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const refreshMembers = async () => {
    await refetch();
  };

  const filteredUsers =
    members?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.role?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getRoleBadge = (role?: string) => {
    const r = (role || "member").toLowerCase();
    if (r === "admin" || r === "superadmin") {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
          <HiOutlineShieldCheck className="h-3.5 w-3.5" />
          Admin
        </span>
      );
    }
    if (r === "manager") {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
          <HiOutlineShieldCheck className="h-3.5 w-3.5" />
          Manager
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-surface-overlay-d border border-slate-200 dark:border-surface-border-d px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <HiOutlineUser className="h-3.5 w-3.5" />
        Member
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
            <HiOutlineUsers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Team Members
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage workspace collaborators, roles, and project access
            </p>
          </div>
        </div>

        <UserModal refetch={refreshMembers} manager={false}>
          <button className="btn-brand py-2.5 px-4 text-xs inline-flex items-center gap-1.5 self-start sm:self-auto">
            <HiOutlinePlus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </UserModal>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or role…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "2.5rem" }}
            className="input-field text-xs sm:text-sm w-full py-2"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card overflow-hidden">
        {members ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 dark:border-surface-border-d bg-slate-50/80 dark:bg-surface-overlay-d/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-surface-border-d">
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                      >
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-surface-overlay-d/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.avatar}
                              alt={user.name}
                              className="h-9 w-9 ring-2 ring-slate-100 dark:ring-surface-border-d"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {user.name}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                ID: #{user.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <EditUserModal
                              user={user}
                              onEditSuccess={refreshMembers}
                            >
                              <button
                                title="Edit user"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-surface-overlay-d dark:hover:text-slate-200 transition-colors"
                              >
                                <HiOutlinePencilSquare className="h-4 w-4" />
                              </button>
                            </EditUserModal>
                            <DeleteUserModal
                              user={user}
                              onDeleteSuccess={refreshMembers}
                            >
                              <button
                                title="Delete user"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                              >
                                <HiOutlineTrash className="h-4 w-4" />
                              </button>
                            </DeleteUserModal>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};

export default withProjectLayout(Userspage);
