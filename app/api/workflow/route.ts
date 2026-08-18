import { parseCookies } from "@/utils/cookies";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const DEFAULT_WORKFLOW = {
  nodes: [
    { id: "1", data: { label: "TODO" } },
    { id: "2", data: { label: "IN_PROGRESS" } },
    { id: "3", data: { label: "DONE" } },
  ],
  edges: [],
};

export async function GET(req: Request) {
  try {
    const projectCookie = parseCookies(req, "project");
    const projectId = projectCookie?.id;

    if (!projectId) {
      return NextResponse.json({ workflow: DEFAULT_WORKFLOW }, { status: 200 });
    }

    const workflowRecord = await prisma.workflow.findUnique({
      where: { projectId: typeof projectId === "string" ? parseInt(projectId) : projectId },
    });

    if (!workflowRecord || !workflowRecord.workflow) {
      return NextResponse.json({ workflow: DEFAULT_WORKFLOW }, { status: 200 });
    }

    return NextResponse.json({ workflow: workflowRecord.workflow }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json({ workflow: DEFAULT_WORKFLOW }, { status: 200 });
  }
}

export async function PATCH(req: Request) {
  try {
    const projectCookie = parseCookies(req, "project");
    const projectId = projectCookie?.id;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const { nodes, edges } = await req.json();

    if (!nodes || !edges) {
      return NextResponse.json(
        { error: "Invalid workflow data" },
        { status: 400 }
      );
    }

    const numericProjectId = typeof projectId === "string" ? parseInt(projectId) : projectId;

    const updatedWorkflow = await prisma.workflow.upsert({
      where: { projectId: numericProjectId },
      create: {
        projectId: numericProjectId,
        workflow: { nodes, edges },
      },
      update: {
        workflow: { nodes, edges },
      },
    });

    return NextResponse.json({ Workflow: updatedWorkflow }, { status: 200 });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
