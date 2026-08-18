import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parseCookies, parsePageCookies } from "@/utils/cookies";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getBaseUrl } from "@/utils/helpers";

const prisma = new PrismaClient();

export async function GET() {
  const user = parsePageCookies("user");
  const companyId = user?.companyId;
  if (!companyId) {
    return NextResponse.json({ users: [] }, { status: 200 });
  }
  try {
    const users = await prisma.defaultUser.findMany({
      where: {
        companyId,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();
    const { id: projectId } = parseCookies(req, "project");
    const { companyId } = parseCookies(req, "user");

    const url = new URL(req.url);
    const role = url.searchParams.get("role") === "manager";

    const resetToken = jwt.sign(
      { email: email, projectId: projectId },
      process.env.JWT_SECRET!,
      { expiresIn: "3d" }
    );
    const ProjectToken = jwt.sign(
      { projectId: projectId },
      process.env.JWT_SECRET!,
      { expiresIn: "3d" }
    );
    const baseUrl = getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const projectUrl = `${baseUrl}/login?token=${ProjectToken}`;

    const existingUser = await prisma.defaultUser.findFirst({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await prisma.member.findFirst({
        where: {
          id: existingUser.id,
          projectId,
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "Email already exists in this project" },
          { status: 401 }
        );
      } else {
        const newMember = await prisma.member.create({
          data: {
            id: existingUser.id,
            projectId,
            manager: role, 
          },
        });

        return NextResponse.json(
          { user: existingUser, member: newMember, projectUrl },
          { status: 201 }
        );
      }
    } else {
      const hashedPassword = await bcrypt.hash("member@f2-fin", 10);
      const newUser = await prisma.defaultUser.create({
        data: {
          name,
          email,
          password: hashedPassword,
          companyId: parseInt(companyId),
        },
      });

      const newMember = await prisma.member.create({
        data: {
          id: newUser.id,
          projectId,
          manager: role, 
        },
      });

      return NextResponse.json(
        { user: newUser, member: newMember, url: resetUrl },
        { status: 201 }
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

export async function PATCH(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.defaultUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user with provided fields
    const updatedUser = await prisma.defaultUser.update({
      where: { id },
      data: {
        ...(name && { name }),
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const projectId = parseCookies(req, "project").id;
    const { userId } = await req.json();

    // Validate projectId and userId
    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "Project ID and User ID are required" },
        { status: 400 }
      );
    }

    // Delete the specific record by its unique ID
    await prisma.member.deleteMany({
      where: {
        AND: [{ id: userId }, { projectId: projectId }],
      },
    });

    return NextResponse.json(
      { message: "User successfully deleted from the project" },
      { status: 200 }
    );
  } catch (error) {
    console.error("ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
