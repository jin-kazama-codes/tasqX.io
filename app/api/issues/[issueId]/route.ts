import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { type Issue, IssueType, type DefaultUser } from "@prisma/client";
import { z } from "zod";
import { type GetIssuesResponse } from "../route";
import { parseCookies } from "@/utils/cookies";

export type GetIssueDetailsResponse = {
  issue: GetIssuesResponse["issues"][number] | null;
};

export type PostIssueResponse = { issue: Issue };

export async function GET(
  req: NextRequest,
  { params }: { params: { issueId: string } }
) {
  const projectCookie = parseCookies(req, "project");
  const projectId = projectCookie?.id;
  const { issueId } = params;

  if (!issueId) {
    return NextResponse.json({ error: "Issue ID/Key is required" }, { status: 400 });
  }

  try {
    const numericProjectId =
      projectId && !isNaN(Number(projectId)) ? parseInt(String(projectId)) : undefined;

    // Fetch the main issue by key or by id
    const issue = await prisma.issue.findFirst({
      where: {
        OR: [{ key: issueId }, { id: issueId }],
        ...(numericProjectId ? { projectId: numericProjectId } : {}),
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Fetch child issues
    const childIssues = await prisma.issue.findMany({
      where: {
        parentId: issue.id,
      },
    });

    // Fetch sprint only if sprintId exists
    const sprint = issue.sprintId
      ? await prisma.sprint.findUnique({
          where: { id: issue.sprintId },
        })
      : null;

    const assignee = issue.assigneeId
      ? await prisma.defaultUser.findUnique({
          where: { id: issue.assigneeId },
        })
      : null;

    // Combine data into a single object
    const issueWithChildren = {
      ...issue,
      children: childIssues,
      sprint,
      assignee,
    };

    return NextResponse.json({ issue: issueWithChildren }, { status: 200 });
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const patchIssueBodyValidator = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(IssueType).optional(),
  status: z.string().optional(),
  sprintPosition: z.number().optional(),
  boardPosition: z.number().optional(),
  assigneeId: z.number().nullable().optional(),
  reporterId: z.number().optional(),
  parentId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  estimateTime: z.string().nullable().optional(),
  timeSpent: z.string().nullable().optional(),
  isDeleted: z.boolean().optional(),
  sprintColor: z.string().optional(),
});

export type PatchIssueBody = z.infer<typeof patchIssueBodyValidator>;
export type PatchIssueResponse = {
  issue: Issue & { assignee: DefaultUser | null };
};

type ParamsType = {
  params: {
    issueId: string;
  };
};

export async function PATCH(req: NextRequest, { params }: ParamsType) {
  const userCookie = parseCookies(req, "user");
  const userId = userCookie?.id;
  const projectCookie = parseCookies(req, "project");
  const projectId = projectCookie?.id;

  if (!userId) return new Response("Unauthenticated request", { status: 403 });

  const { issueId } = params;

  try {
    const json = await req.json();
    const body = patchIssueBodyValidator.parse(json);

    // Find the issue to update by id or key
    const existingIssue = await prisma.issue.findFirst({
      where: {
        OR: [{ id: issueId }, { key: issueId }],
      },
    });

    if (!existingIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const updatedIssue = await prisma.issue.update({
      where: {
        id: existingIssue.id,
      },
      data: {
        ...body,
      },
      include: {
        assignee: true,
      },
    });

    return NextResponse.json({ issue: updatedIssue }, { status: 200 });
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
