"use client";

import axios from "axios";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabaseBrowser } from "@/lib/supabase";

export type Endpoint = "courseImage" | "courseAttachment" | "chapterVideo";

const CLIENT_CONFIG: Record<Endpoint, { maxSize: number; allowedTypes: string[]; label: string }> = {
    courseImage: { maxSize: 4 * 1024 * 1024, allowedTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"], label: "Image (max 4MB)" },
    courseAttachment: { maxSize: 16 * 1024 * 1024, allowedTypes: ["application/pdf", "text/plain"], label: "PDF or text file (max 16MB)" },
    chapterVideo: { maxSize: 50 * 1024 * 1024, allowedTypes: ["video/mp4", "video/webm", "video/quicktime"], label: "Video (max 50MB)" },
};

interface FileUploadProps {
    onChange: (url?: string) => void;
    endpoint: Endpoint;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const config = CLIENT_CONFIG[endpoint];

    const uploadFile = async (file: File) => {
        if (!config.allowedTypes.includes(file.type)) {
            toast.error("Unsupported file type");
            return;
        }
        if (file.size > config.maxSize) {
            toast.error("File is too large");
            return;
        }

        setIsUploading(true);
        try {
            const { data } = await axios.post("/api/storage/sign-upload", {
                endpoint,
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
            });

            const { bucket, path, token } = data;

            const { error: uploadError } = await supabaseBrowser.storage
                .from(bucket)
                .uploadToSignedUrl(path, token, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrlData } = supabaseBrowser.storage
                .from(bucket)
                .getPublicUrl(path);

            onChange(publicUrlData.publicUrl);
        } catch (error) {
            console.error("[FILE_UPLOAD]", error);
            toast.error("Something went wrong during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFiles = (files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                isDragging ? "border-sky-500 bg-sky-50" : "border-slate-300 bg-slate-50",
                isUploading && "pointer-events-none opacity-60"
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept={config.allowedTypes.join(",")}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            {isUploading ? (
                <>
                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    <p className="text-xs text-slate-500">Uploading… do not close this tab</p>
                </>
            ) : (
                <>
                    <Upload className="h-8 w-8 text-slate-500" />
                    <p className="text-sm text-slate-600">Click or drag a file to upload</p>
                    <p className="text-xs text-slate-400">{config.label}</p>
                </>
            )}
        </div>
    );
};
