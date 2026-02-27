"use client";

import Image from "next/image";
import { useState } from "react";
import { getChampionImageUrl } from "@/lib/utils";

interface ChampionImageProps {
  championName: string;
  size?: number;
  level?: number;
  className?: string;
}

export default function ChampionImage({
  championName,
  size = 48,
  level,
  className = "",
}: ChampionImageProps) {
  const [error, setError] = useState(false);

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {error ? (
        <div
          className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400"
          style={{ width: size, height: size }}
        >
          {championName?.slice(0, 2)}
        </div>
      ) : (
        <Image
          src={getChampionImageUrl(championName)}
          alt={championName}
          width={size}
          height={size}
          className="rounded-full object-cover"
          onError={() => setError(true)}
        />
      )}
      {level !== undefined && (
        <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-gray-700">
          {level}
        </span>
      )}
    </div>
  );
}
