import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { isTeacher } from "@/lib/teacher";
import { NextResponse } from "next/server";

export async function POST(req: Request,) {
    try {
        const { userId } = await auth();
        const { title } = await req.json();
        if (!userId || !(await isTeacher())) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const course = await prisma.course.create({
            data: {
                userId,
                title
            }
        })
        return NextResponse.json(course)
    } catch (error) {
        console.log("[COURSES]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}