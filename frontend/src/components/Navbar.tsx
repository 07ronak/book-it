"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const query = search.trim();
    if (query) {
      router.push(`/experiences?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`/experiences`);
    }
  };

  const handleMobileSearch = () => {
    const query = mobileSearch.trim();
    if (query) {
      router.push(`/experiences?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`/experiences`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 shadow-md bg-white">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <Link href="/experiences" className="flex items-center">
          <img src="/logo.png" alt="Experio Logo" className="h-12 w-auto" />
        </Link>

        {/* Desktop Search */}
        <div className="hidden sm:flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search experiences"
            className="px-3 py-2 bg-gray-100 rounded focus:outline-none w-70 text-sm"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-yellow-400 rounded text-black hover:bg-yellow-500 text-sm"
          >
            Search
          </button>
        </div>

        {/* Mobile Search */}
        <div className="flex sm:hidden items-center gap-2">
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMobileSearch()}
            placeholder="Search..."
            className="px-3 py-2 bg-gray-100 rounded focus:outline-none w-32 text-sm"
          />
          <button
            onClick={handleMobileSearch}
            className="px-3 py-2 bg-yellow-400 rounded text-black hover:bg-yellow-500 text-sm"
          >
            Go
          </button>
        </div>
      </div>
    </nav>
  );
}
