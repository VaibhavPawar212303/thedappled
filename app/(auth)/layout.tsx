import React from "react";
import { LandingNavbar } from "@/app/_components/landing-navbar";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full">
            <LandingNavbar />
            <div className="pt-20 h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}

export default AuthLayout;