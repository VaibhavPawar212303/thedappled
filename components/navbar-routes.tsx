"use client"

import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
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
        <div className="flex items-center gap-x-2 ml-auto">
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
            <SignedIn>
                <UserButton />
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50">
                        Log in
                    </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                        Get Started
                    </Button>
                </SignUpButton>
            </SignedOut>
        </div>
    )
}