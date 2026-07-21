"use client"

import { useUser, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";


export const NavbarRoutes = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const isTeacherUser = user?.publicMetadata?.userType === "teacher";
    const isTeacherPage = pathname?.startsWith('/teacher');
    const isPlayerPage = pathname?.startsWith('/chapter');


    return (
        <div className="flex gap-x-2 ml-auto">
            {
                isTeacherPage || isPlayerPage ? (
                    <Link href="/">
                        <Button size='sm' variant='outline'>
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit
                        </Button>
                    </Link>
                ) : isTeacherUser ? (
                    <Link href="/teacher/courses">
                        <Button size='sm' variant='outline'>
                            Teacher Mode
                        </Button>
                    </Link>
                ) : null
            }
            <ModeToggle />
            <UserButton />
        </div>
    )
}