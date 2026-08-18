import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { IssueType, type Issue, type DefaultUser } from "@prisma/client";
import { z } from "zod";
import {
  calculateInsertPosition,
  generateIssuesForClient,
} from "@/utils/helpers";
import { parseCookies } from "@/utils/cookies";

const postIssuesBodyValidator = z.object({
  name: z.string(),
  type: z.enum(["BUG", "STORY", "TASK", "EPIC", "SUBTASK"]),
  status: z.string().optional(),
  sprintId: z.string().nullable(),
  reporterId: z.string().nullable(),
  parentId: z.string().nullable(),
  sprintColor: z.string().nullable().optional(),
});

export type PostIssueBody = z.infer<typeof postIssuesBodyValidator>;

const patchIssuesBodyValidator = z.object({
  ids: z.array(z.string()),
  type: z.nativeEnum(IssueType).optional(),
  status: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  reporterId: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  isDeleted: z.boolean().optional(),
});

export type PatchIssuesBody = z.infer<typeof patchIssuesBodyValidator>;

type IssueT = Issue & {
  children: IssueT[];
  sprintIsActive: boolean;
  parent: Issue & {
    sprintIsActive: boolean;
    children: IssueT[];
    parent: null;
    assignee: DefaultUser | null;
    reporter: DefaultUser | null;
  };
  assignee: DefaultUser | null;
  reporter: DefaultUser | null;
  projectId: number;
};

export type GetIssuesResponse = {
  issues: IssueT[];
};

export async function GET(req: NextRequest) {
  const { id: projectId, showAssignedTasks } = parseCookies(req, "project");
  const { id: userId, role: userRole } = parseCookies(req, "user");
  const { searchParams } = new URL(req.url);
  
  const isAdminOrManager = userRole && (userRole === "admin" || userRole === "manager");

  const hasSprintParam = searchParams.has("sprintId");
  const rawSprintId = searchParams.get("sprintId");

  let sprintFilter: any = undefined;

  if (hasSprintParam && rawSprintId !== "all") {
    if (rawSprintId === "undefined" || rawSprintId === "backlog" || rawSprintId === "null" || !rawSprintId) {
      sprintFilter = null;
    } else {
      sprintFilter = rawSprintId;
    }
  }

  // Fetch issues
  const activeIssues = await prisma.issue.findMany({
    where: {
      projectId: projectId,
      isDeleted: false,
      ...(sprintFilter !== undefined ? { sprintId: sprintFilter } : {}),
      ...(showAssignedTasks && !isAdminOrManager ? { assigneeId: userId } : {}),
    },
  });

  if (!activeIssues.length) {
    return NextResponse.json({ issues: [] });
  }

  // Fetch all child issues related to active issues
  const childIssues = await prisma.issue.findMany({
    where: {
      parentId: {
        in: activeIssues.map((issue) => issue.id),
      },
    },
  });

  // Fetch user data
  const userIds = activeIssues
    .flatMap((issue) => [issue.assigneeId, issue.reporterId] as string[])
    .filter(Boolean);

  const users = await prisma.defaultUser.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  // Generate client-ready issues
  const issuesForClient = generateIssuesForClient(activeIssues, users);

  // Attach child issues to their respective parent issues
  const issuesWithChildren = issuesForClient.map((issue) => ({
    ...issue,
    children: childIssues.filter((child) => child.parentId === issue.id),
  }));

  return NextResponse.json({ issues: issuesWithChildren });
}


const createChildIssues = async (
  KEY,
  k,
  userId,
  projectId,
  positionToInsert,
  boardPosition,
  issue
) => {
  // get parent issue the oldest because that will have child issues
  const childIssue = await prisma.issue.findFirst({
    where: {
      projectId: projectId,
      isDeleted: false,
      parentId: {
        not: null,
      },
    },
  });

  // create child issues for the current issue
  if (childIssue?.parentId) {
    // get child issues using the parentIssue id as parentId
    const childIssues = await prisma.issue.findMany({
      where: {
        projectId: projectId,
        isDeleted: false,
        parentId: childIssue.parentId,
      },
    });

    childIssues.map(async (child, index) => {
      await prisma.issue.create({
        data: {
          key: `${KEY}-${k + index + 1}`,
          name: child.name,
          type: child.type,
          reporterId: userId, // Admin as default reporter
          sprintId: child.sprintId ?? undefined,
          projectId: projectId,
          sprintPosition: positionToInsert + index + 1,
          boardPosition: boardPosition + index + 1,
          parentId: issue.id,
          sprintColor: child.sprintColor,
          creatorId: userId,
        },
      });
    });
  }
};

// POST
export async function POST(req: NextRequest) {
  const { id: projectId, key: KEY, cloneChild } = parseCookies(req, "project");
  const userId = parseCookies(req, "user").id;

  if (!userId) return new Response("Unauthenticated request", { status: 403 });
  // const { success } = await ratelimit.limit(userId);
  // if (!success) return new Response("Too many requests", { status: 429 });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = await req.json();

  const validated = postIssuesBodyValidator.safeParse(body);

  if (!validated.success) {
    const message =
      "Invalid body. " + (validated.error.errors[0]?.message ?? "");
    return new Response(message, { status: 400 });
  }

  const { data: valid } = validated;

  const issues = await prisma.issue.findMany({
    where: {
      projectId: projectId,
    },
  });

  const currentSprintIssues = issues.filter(
    (issue) => issue.sprintId === valid.sprintId && issue.isDeleted === false
  );

  const sprint = await prisma.sprint.findUnique({
    where: {
      id: valid.sprintId ?? "",
    },
  });

  let boardPosition = -1;

  if (sprint && sprint.status === "ACTIVE") {
    // If issue is created in active sprint, add it to the bottom of the TODO column in board
    const issuesInColum = currentSprintIssues.filter(
      (issue) => issue.status === "To Do"
    );
    boardPosition = calculateInsertPosition(issuesInColum);
  }

  const k = issues.length + 1;

  const positionToInsert = calculateInsertPosition(currentSprintIssues);

  const issue = await prisma.issue.create({
    data: {
      key: `${KEY}-${k}`,
      name: valid.name,
      type: valid.type,
      status: valid.status ?? "To Do",
      reporterId: userId, // Admin as default reporter
      sprintId: valid.sprintId ?? undefined,
      projectId: projectId,
      sprintPosition: positionToInsert,
      boardPosition,
      parentId: valid.parentId,
      sprintColor: valid.sprintColor,
      creatorId: userId,
    },
  });

  // create child issues by default
  if (cloneChild && issue?.parentId === null) {
    await createChildIssues(
      KEY,
      k,
      userId,
      projectId,
      positionToInsert,
      boardPosition,
      issue
    );
  }
  // return NextResponse.json<PostIssueResponse>({ issue });
  return NextResponse.json({ issue });
}

export async function PATCH(req: NextRequest) {
  const userId = parseCookies(req, "user").id;
  const { id: projectId } = parseCookies(req, "project");

  if (!userId) return new Response("Unauthenticated request", { status: 403 });
  // const { success } = await ratelimit.limit(userId);
  // if (!success) return new Response("Too many requests", { status: 429 });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = await req.json();
  const validated = patchIssuesBodyValidator.safeParse(body);

  if (!validated.success) {
    // eslint-disable-next-line
    const message = "Invalid body. " + validated.error.errors[0]?.message ?? "";
    return new Response(message, { status: 400 });
  }

  const { data: valid } = validated;

  const issuesToUpdate = await prisma.issue.findMany({
    where: {
      id: {
        in: valid.ids,
      },
    },
  });

  const updatedIssues = await Promise.all(
    issuesToUpdate.map(async (issue) => {
      return await prisma.issue.update({
        where: {
          id: issue.id,
        },
        data: {
          type: valid.type ?? undefined,
          status: valid.status ?? undefined,
          assigneeId: valid.assigneeId ?? undefined,
          reporterId: valid.reporterId ?? undefined,
          isDeleted: valid.isDeleted ?? undefined,
          sprintId: valid.sprintId === undefined ? undefined : valid.sprintId,
          parentId: valid.parentId ?? undefined,
          projectId: projectId,
        },
      });
    })
  );

  // return NextResponse.json<PostIssueResponse>({ issue });
  return NextResponse.json({ issues: updatedIssues });
}
