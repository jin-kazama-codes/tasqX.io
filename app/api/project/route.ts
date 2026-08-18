import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { type Project } from "@prisma/client";
import { parsePageCookies } from "@/utils/cookies";

export type GetProjectResponse = {
  project: Project | null;
};

export async function GET() {
  const projectData = parsePageCookies("project");
  if (!projectData?.key) {
    return NextResponse.json({ project: null });
  }
  const project = await prisma.project.findUnique({
    where: {
      key: projectData.key,
    },
  });
  // return NextResponse.json<GetProjectResponse>({ project });
  return NextResponse.json({ project });
}

export async function POST(request: Request) {
  const user = parsePageCookies("user");
  const companyId = user?.companyId;
  const { name, key, userId, icon, imageUrl } = await request.json();

  if (!name || !key || !userId) {
    return NextResponse.json(
      { error: "Name, key, and userId are required" },
      { status: 400 }
    );
  }

  try {
    // Check if a project with the same name or key already exists within the same company
    const existingProject = await prisma.project.findFirst({
      where: {
        companyId,
        OR: [{ name }, { key }],
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project with the same name or key already exists" },
        { status: 400 }
      );
    }

    // Create new project
    const newProject = await prisma.project.create({
      data: {
        name,
        key,
        imageUrl: icon || imageUrl || "🚀",
        defaultAssignee: String(userId),
        companyId,
      },
    });

    const workflowData = {
      nodes: [
        {
          id: "1",
          data: { label: "To Do" },
          position: { x: 50, y: 50 },
          priority: 1,
        },
        {
          id: "2",
          data: { label: "In Progress" },
          position: { x: 250, y: 50 },
          priority: 2,
        },
        {
          id: "3",
          data: { label: "Done" },
          position: { x: 450, y: 50 },
          priority: 3,
        },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
      ],
    };

    // Create workflow only if it does not exist
    const workflow = await prisma.workflow.create({
      data: {
        projectId: newProject.id,
        workflow: workflowData,
      },
    });

    return NextResponse.json({ Project: newProject, Workflow: workflow });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating project" },
      { status: 500 }
    );
  }
}
