"use client"

import { cn } from "@/lib/utils"
import { CheckCircle, Lock, PlayCircle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

interface CourseSidebarItemProps {
    label: string,
    id: string,
    isCompleted: boolean
    courseId: string
    isLocked: boolean
}

export const CourseSidebarItem = ({ label, id, isCompleted, courseId, isLocked }: CourseSidebarItemProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const Icon = isLocked ? Lock : (isCompleted ? CheckCircle : PlayCircle);
    const isActive = pathname?.includes(id);

    const onClick = () => {
        router.push(`/course/${courseId}/chapters/${id}`);
    }


    return (
        <button
            onClick={onClick}
            type="button"
            className={cn("flex items-center gap-x-2 text-slate-500 dark:text-slate-400 text-sm font-[500] pl-6 transition-all hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-300/20 dark:hover:bg-slate-800",
                isActive && "text-slate-700 dark:text-slate-100 bg-slate-200/20 dark:bg-slate-800 hover:bg-slate-200/20 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-100",
                isCompleted && "text-emerald-700 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400",
                isCompleted && isActive && "bg-emerald-200/20 dark:bg-emerald-950",
            )}
        >
            <div className="flex items-center gap-x-2 py-4">
                <Icon size={22} className={cn("text-slate-500 dark:text-slate-400",
                    isActive && "text-slate-700 dark:text-slate-100",
                    isCompleted && "text-emerald-700 dark:text-emerald-400")} />
                {label}
            </div>
            <div className={cn("ml-auto w-1 self-stretch opacity-0 bg-slate-700 dark:bg-slate-100 transition-all",
                isActive && "opacity-100",
                isCompleted && "bg-emerald-700 dark:bg-emerald-400"
            )} />
        </button>
    )
}