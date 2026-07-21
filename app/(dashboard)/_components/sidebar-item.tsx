"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
// import { useRouter } from "next/router";

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    href: string;
}



export const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const isActive = (pathname === "/" && href === "/") || (pathname === href || pathname?.startsWith(`${href}/`));

    const onClick = () => {
        router.push(href);
    }

    return (
        <button
            onClick={onClick}
            type="button"
            className={
                cn(
                    "flex items-center gap-x-2 text-slate-500 dark:text-slate-400 text-sm font-[500] pl-6 transition-all hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-300/20 dark:hover:bg-slate-800",
                    isActive && "text-slate-700 dark:text-slate-100 bg-slate-200 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-100"
                )
            }
        >
            <div className="flex items-center gap-x-2 py-4">
                <Icon
                    size={22}
                    className={
                        cn(
                            "text-slate-500 dark:text-slate-400", isActive && "text-slate-700 dark:text-slate-100"
                        )
                    }
                />
                {label}
            </div>
            <div
            className={cn(
                "ml-auto w-1 self-stretch opacity-0 bg-slate-700 dark:bg-slate-100 transition-all", isActive && "opacity-100"
            )}
            />
        </button>
    );
}