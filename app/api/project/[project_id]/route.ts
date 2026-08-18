import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { type Project } from "@prisma/client";

export type GetProjectResponse = {
  project: Project | null;
};

export async function GET(
  request: Request,
  { params }: { params: { projectKey: string } }
) {
  try {
    const { project_id } = params;

    if (!project_id) {
      return NextResponse.json(
        { error: "Project key or ID is required" },
        { status: 400 }
      );
    }

    const isNumeric = !isNaN(Number(project_id));
    const project = isNumeric
      ? await prisma.project.findFirst({
          where: { OR: [{ id: parseInt(project_id) }, { key: project_id }] },
        })
      : await prisma.project.findFirst({
          where: { key: project_id },
        });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json<GetProjectResponse>({ project });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const { project_id } = params;

    if (!project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Find active issues for the specified project
    const activeIssues = await prisma.issue.findMany({
      where: {
        isDeleted: false,
        projectId: parseInt(project_id),
      },
    });

    if (!activeIssues || activeIssues.length === 0) {
      await prisma.member.deleteMany({
        where: {
          projectId: parseInt(project_id),
        },
      });
      // Delete the project as it has no active issues
      await prisma.project.delete({
        where: { id: parseInt(project_id) },
      });
      return NextResponse.json(
        { message: "Project successfully deleted" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Cannot delete project as it has active issues" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
