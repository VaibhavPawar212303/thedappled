import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const ENDPOINT_CONFIG = {
    courseImage: {
        bucket: "course-images",
        maxSize: 4 * 1024 * 1024,
        allowedTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    },
    courseAttachment: {
        bucket: "course-attachments",
        maxSize: 16 * 1024 * 1024,
        allowedTypes: ["application/pdf", "text/plain"],
    },
    chapterVideo: {
        bucket: "chapter-videos",
        maxSize: 50 * 1024 * 1024,
        allowedTypes: ["video/mp4", "video/webm", "video/quicktime"],
    },
} as const;

type Endpoint = keyof typeof ENDPOINT_CONFIG;

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { endpoint, fileName, contentType, fileSize } = await req.json();

        if (!endpoint || !(endpoint in ENDPOINT_CONFIG)) {
            return new NextResponse("Invalid endpoint", { status: 400 });
        }
        const config = ENDPOINT_CONFIG[endpoint as Endpoint];

        if (typeof fileName !== "string" || !fileName) {
            return new NextResponse("Missing fileName", { status: 400 });
        }
        if (!(config.allowedTypes as readonly string[]).includes(contentType)) {
            return new NextResponse("Unsupported file type", { status: 400 });
        }
        if (typeof fileSize !== "number" || fileSize > config.maxSize) {
            return new NextResponse("File too large", { status: 400 });
        }

        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
        const path = `${userId}/${randomUUID()}-${safeName}`;

        const { data, error } = await supabaseAdmin.storage
            .from(config.bucket)
            .createSignedUploadUrl(path);

        if (error || !data) {
            console.error("[SIGN_UPLOAD]", error);
            return new NextResponse("Internal Error", { status: 500 });
        }

        return NextResponse.json({
            bucket: config.bucket,
            path: data.path,
            token: data.token,
            signedUrl: data.signedUrl,
        });
    } catch (error) {
        console.error("[SIGN_UPLOAD]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
