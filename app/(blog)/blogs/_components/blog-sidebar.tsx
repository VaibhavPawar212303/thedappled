import { cn } from "@/lib/utils";
import { BlogTableOfContents } from "../[blogId]/_components/blog-table-of-contents";

interface BlogSidebarProps {
  // The fixed desktop sidebar sits under the fixed navbar and needs pt-20
  // to clear it; the mobile Sheet version has no navbar overlapping it.
  inSheet?: boolean;
}

export const BlogSidebar = ({ inSheet = false }: BlogSidebarProps) => {
  return (
    <div
      className={cn(
        "h-full border-r flex flex-col overflow-y-auto shadow-sm bg-background",
        inSheet ? "pt-2" : "pt-20"
      )}
    >
      <BlogTableOfContents />
    </div>
  );
};
