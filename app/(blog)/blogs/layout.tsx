import { BlogNavbar } from "./_components/blog-navbar";
import { BlogSidebar } from "./_components/blog-sidebar";
import { AppLogoLink } from "@/app/_components/app-logo-link";

const BlogLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="min-h-screen bg-muted/40">
            {/* Brand corner: sits above the header/sidebar seam so the logo
                has a real home instead of floating in the sidebar's own
                top-clearance gap. */}
            <div className="hidden md:flex h-[80px] w-72 fixed inset-y-0 left-0 z-[60] items-center px-6 border-b border-r bg-background">
                <AppLogoLink className="hover:opacity-90 transition" />
            </div>

            {/* Navbar Wrapper */}
            <div className="h-[80px] md:pl-72 fixed inset-y-0 w-full z-50">
                <BlogNavbar />
            </div>

            {/* Table of contents sidebar */}
            <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-40">
                <BlogSidebar />
            </div>

            {/* Main Content */}
            <main className="h-full md:pl-72 pt-24">
                <div className="max-w-5xl mx-auto p-6 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default BlogLayout;