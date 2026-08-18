/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { generateIssuesForClient } from "@/utils/helpers";

import {
  defaultUsers,
  generateInitialUserComments,
  generateInitialUserIssues,
  generateInitialUserSprints,
} from "../prisma/seed-data";
import { prisma } from "./db";
import { SprintStatus } from "@prisma/client";
import { parsePageCookies } from "@/utils/cookies";

export async function getInitialIssuesFromServer() {
  const PROJECT = parsePageCookies("project");
  let activeIssues = await prisma.issue.findMany({
    where: {
      isDeleted: false,
      projectId: PROJECT.id,
    },
  });

  if (!activeIssues || activeIssues.length === 0) {
    return [];
  }

  const activeSprints = await prisma.sprint.findMany({
    where: {
      projectId: PROJECT.id,
      status: "ACTIVE",
    },
  });

  const userIds = activeIssues
    .flatMap((issue) => [issue.assigneeId, issue.reporterId] as string[])
    .filter(Boolean);

  // USE THIS IF RUNNING LOCALLY ----------------------
  const users = await prisma.defaultUser.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  const issues = generateIssuesForClient(
    activeIssues,
    users,
    activeSprints.map((sprint) => sprint.id)
  );
  return issues;
}

export function getInitialProjectFromServer() {
  return parsePageCookies("project");
}

export async function getInitialSprintsFromServer() {
  const PROJECT = parsePageCookies("project");
  let sprints = await prisma.sprint.findMany({
    where: {
      OR: [{ status: SprintStatus.ACTIVE }, { status: SprintStatus.PENDING }],
      projectId: PROJECT.id,
    },
    orderBy: {
      position: "asc",
    },
  });

  return sprints;
}

export async function initProject() {
  await prisma.project.upsert({
    where: {
      id: "init-project-id-dq8yh-d0as89hjd",
    },
    update: {},
    create: {
      id: "init-project-id-dq8yh-d0as89hjd",
      name: "TasqX Platform",
      key: "TASQX",
    },
  });
}
export async function initDefaultUsers() {
  await Promise.all(
    defaultUsers.map(
      async (user) =>
        await prisma.defaultUser.upsert({
          where: {
            id: user.id,
          },
          update: {
            avatar: user.avatar,
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
          },
        })
    )
  );
}
export async function initDefaultProjectMembers(projectId: number) {
  await Promise.all(
    defaultUsers.map(
      async (user) =>
        await prisma.member.upsert({
          where: {
            id: user.id,
          },
          update: {},
          create: {
            id: user.id,
            projectId: projectId,
          },
        })
    )
  );
}

export async function initDefaultIssues(userId: string) {
  const initialIssues = generateInitialUserIssues(userId);
  await Promise.all(
    initialIssues.map(
      async (issue) =>
        await prisma.issue.upsert({
          where: {
            id: issue.id,
          },
          update: {},
          create: {
            ...issue,
          },
        })
    )
  );
}

export async function initDefaultIssueComments(userId: string) {
  const initialComments = generateInitialUserComments(userId);
  await Promise.all(
    initialComments.map(
      async (comment) =>
        await prisma.comment.upsert({
          where: {
            id: comment.id,
          },
          update: {},
          create: {
            ...comment,
          },
        })
    )
  );
}

export async function initDefaultSprints(userId: string) {
  const initialSprints = generateInitialUserSprints(userId);
  await Promise.all(
    initialSprints.map(
      async (sprint) =>
        await prisma.sprint.upsert({
          where: {
            id: sprint.id,
          },
          update: {},
          create: {
            ...sprint,
          },
        })
    )
  );
}

export async function previousSprint(
  projectId,
  previousSprintPosition: number
) {
  const prevSprint = await prisma.sprint.findMany({
    where: {
      projectId: projectId,
      sprintPosition: previousSprintPosition,
    },
  });

  return prevSprint[0].id;
}


