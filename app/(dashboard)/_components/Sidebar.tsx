import { AppLogoLink } from "@/app/_components/app-logo-link";
import { SidebarRoutes } from "./sidebar-routes";

export const Sidebar = () => {
    return (
        <div className="h-full border-r flex flex-col overflow-y-auto bg-background shadow-sm">
            <div className="p-6">
                {/* Signed out -> landing page, signed in -> dashboard */}
                <AppLogoLink className="hover:opacity-90 transition" />
            </div>
            <div className="flex flex-col w-full">
                <SidebarRoutes />
            </div>
        </div>
    );
}

export default Sidebar;
