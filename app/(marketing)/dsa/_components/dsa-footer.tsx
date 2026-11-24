import Link from "next/link";

export const COMPILER_URL = "https://c-architech-compiler.vercel.app/?tab=compiler";

export function DsaFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-xl font-bold text-white">Thedappled</p>
          <p className="mt-3 max-w-xs text-sm">Learn modern tech with courses, books and AI-powered articles.</p>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-white">Learn</h4>
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm">
            <li><Link href="/search" className="transition hover:text-white">Courses</Link></li>
            <li><Link href="/books" className="transition hover:text-white">Books</Link></li>
            <li><Link href="/blogs" className="transition hover:text-white">Blogs</Link></li>
            <li><Link href="/testing" className="transition hover:text-white">Testing</Link></li>
            <li><Link href="/dsa" className="text-blue-300 transition hover:text-white">DSA</Link></li>
            <li><a href={COMPILER_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Compiler</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">© 2026 Thedappled Inc. All rights reserved.</div>
    </footer>
  );
}
