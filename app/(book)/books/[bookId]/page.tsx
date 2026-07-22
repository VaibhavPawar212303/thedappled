import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const BookIdPage = async ({ params }: { params: Promise<{ bookId: string }> }) => {
    const { bookId } = await params;  // ✅ Await params
    
    // This page only exists to redirect to the first chapter, so fetch just
    // the one id needed for that instead of every chapter's full record.
    const book = await prisma.book.findUnique({
        where: {
            id: bookId
        },
        select: {
            id: true,
            chapters: {
                where: {
                    isPublished: true
                },
                orderBy: {
                    position: "asc"
                },
                take: 1,
                select: {
                    id: true
                }
            },
        }
    });

    if (!book || !book.chapters[0]) {
        return redirect('/');
    }

    return redirect(`/books/${book.id}/chapters/${book.chapters[0].id}`)
}

export default BookIdPage;