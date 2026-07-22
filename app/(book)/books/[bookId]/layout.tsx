import { getBookProgress } from "@/actions/get-book-progress"; // ✅ Import the new action
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookNavbar } from "./ _components/book-navbar";
import { BookSidebar } from "./ _components/book-sidebar";
import { AppLogoLink } from "@/app/_components/app-logo-link";


const BookLayout = async ({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ bookId: string }>
}) => {
    const { userId } = await auth();
    const { bookId } = await params;
    // Prisma treats `undefined` filter values as "no filter" (would match
    // every user's rows), so anonymous visitors need an explicit value that
    // can never match a real Clerk userId, not undefined.
    const safeUserId = userId ?? "";

    // Publicly browsable — anonymous visitors can view the book shell and
    // any free chapter; locked chapters gate on login at the chapter page.
    // Progress and purchase only need bookId/userId (not the fetched book),
    // so all three run in parallel instead of waiting on each other.
    const [book, progressCount, purchase] = await Promise.all([
        prisma.book.findUnique({
            where: {
                id: bookId
            },
            include: {
                chapters: {
                    where: {
                        isPublished: true
                    },
                    include: {
                        userProgress: {
                            where: {
                                userId: safeUserId
                            }
                        }
                    },
                    orderBy: {
                        position: "asc"
                    }
                }
            }
        }),
        getBookProgress(safeUserId, bookId),
        prisma.bookPurchase.findUnique({
            where: {
                userId_bookId: {
                    userId: safeUserId,
                    bookId,
                }
            }
        }),
    ]);

    if (!book) {
        return redirect('/');
    }

    return (
        <div className="h-full">
            {/* Brand corner: sits above the header/sidebar seam so the logo
                has a real home instead of floating in the sidebar's own
                top-clearance gap. */}
            <div className="hidden md:flex h-[80px] w-80 fixed inset-y-0 left-0 z-[60] items-center px-6 border-b border-r bg-background">
                <AppLogoLink className="hover:opacity-90 transition" />
            </div>
            <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
                <BookNavbar
                    course={book}
                    progressCount={progressCount}
                    purchase={purchase}
                />
            </div>
            <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-40">
                <BookSidebar
                    course={book}
                    progressCount={progressCount}
                    purchase={purchase}
                />
            </div>
            <main className="md:pl-80 h-full pt-24">
                {children}
            </main>
        </div>
    )
}

export default BookLayout;
