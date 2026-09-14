"use client"

import { BarChart, Book, BookAIcon, Compass, File, Layout, List, LucideIcon, Terminal, User } from "lucide-react"
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const guestRoutes: {
    icon: LucideIcon;
    label: string;
    href: string;
    requiresAuth: boolean;
    external?: boolean;
}[] = [
    {
        icon: Layout,
        label: "Dashboard",
        href: "/dashboard",
        // Requires login — /dashboard redirects anonymous visitors to
        // sign-in, so don't show them a link that just bounces.
        requiresAuth: true,
    },
    {
        icon: Compass,
        label: "Browse Courses",
        href: "/search",
        requiresAuth: false,
    },
    {
        icon: Book,
        label: "Course Book",
        href: "/books",
        requiresAuth: false,
    },
     {
        icon: File,
        label: "Blogs",
        href: "/blogs",
        requiresAuth: false,
    },
    {
        icon: Terminal,
        label: "Compiler",
        href: "https://c-architech-compiler.vercel.app/?tab=revision",
        requiresAuth: false,
        external: true,
    },
]

const teacherRoutes = [
    {
        icon: BarChart,
        label: "Analytics",
        href: "/teacher/analytics"
    },
    {
        icon: List,
        label: "Courses",
        href: "/teacher/courses"
    },
    {
        icon: BookAIcon,
        label: "Books",
        href: "/teacher/books"
    },
    {
        icon: User,
        label: "Blogs",
        href: "/teacher/blogs"
    },
]

export const SidebarRoutes = () => {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();
    const isTeacher = pathname?.includes('/teacher');
    const routes = isTeacher
        ? teacherRoutes
        : guestRoutes.filter((route) => isSignedIn || !route.requiresAuth);


    return (
        <div className="flex flex-col w-full">
            {routes.map((route) =>
                <SidebarItem
                    key={route.href}
                    icon={route.icon}
                    label={route.label}
                    href={route.href}
                    external={"external" in route ? Boolean(route.external) : false}
                />
            )}
        </div>
    )
}