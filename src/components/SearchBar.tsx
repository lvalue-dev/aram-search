"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
  size?: "sm" | "lg";
}

export default function SearchBar({ defaultValue = "", size = "lg" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [region, setRegion] = useState("kr");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // 닉네임#태그 형식 파싱
    let gameName = trimmed;
    let tagLine = region === "kr" ? "KR1" : region.toUpperCase();

    if (trimmed.includes("#")) {
      const parts = trimmed.split("#");
      gameName = parts[0].trim();
      tagLine = parts[1]?.trim() || tagLine;
    }

    router.push(`/${region}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`);
  }

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className={`${isLarge ? "px-4 py-3 text-sm" : "px-3 py-2 text-xs"} bg-white/5 border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer`}
      >
        <option value="kr">KR</option>
        <option value="na1">NA</option>
        <option value="euw1">EUW</option>
        <option value="jp1">JP</option>
      </select>
      <div className="flex flex-1 items-center bg-white/5 border border-white/10 rounded-lg focus-within:border-blue-500 transition-colors">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="닉네임#KR1"
          className={`flex-1 bg-transparent ${isLarge ? "px-4 py-3 text-base" : "px-3 py-2 text-sm"} text-white placeholder-slate-500 focus:outline-none`}
        />
        <button
          type="submit"
          className={`${isLarge ? "px-6 py-3 text-sm" : "px-4 py-2 text-xs"} bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-r-lg transition-colors`}
        >
          검색
        </button>
      </div>
    </form>
  );
}
