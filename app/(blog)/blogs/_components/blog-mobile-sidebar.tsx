"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { BlogSidebar } from "./blog-sidebar";
import { AppLogoLink } from "@/app/_components/app-logo-link";

export const BlogMobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-2 hover:opacity-75 transition" aria-label="Open table of contents">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-background w-72 flex flex-col">
        <div className="px-6 pt-6 pb-2">
          <AppLogoLink className="hover:opacity-90 transition" />
        </div>
        <BlogSidebar inSheet />
      </SheetContent>
    </Sheet>
  );
};
