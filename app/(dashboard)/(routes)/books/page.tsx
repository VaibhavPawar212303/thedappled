import { prisma } from "@/lib/db";
import { Categories } from "../search/_components/categories"; // Assuming shared categories component
import { SearchInput } from "@/components/search-input";
import { getBooks } from "@/actions/get-books";
import { BooksList } from "../books/_components/books-list";

interface BooksPageProps {
    searchParams: Promise<{
        title?: string;
        categoryId?: string
    }>
}

const BookPage = async ({ searchParams }: BooksPageProps) => {
    const params = await searchParams;

    // Publicly browsable — no login required to see the catalog.
    const [categories, books] = await Promise.all([
        prisma.category.findMany({
            orderBy: {
                name: "asc"
            }
        }),
        getBooks({ ...params })
    ]);

    return (
        <>
            <div className="px-6 pt-6 md:hidden md:mb-0 block">
                <SearchInput />
            </div>
            <div className="p-6 space-y-4">
                <Categories
                    items={categories}
                />
                <BooksList items={books} />
            </div>
        </>
    );
}

export default BookPage;