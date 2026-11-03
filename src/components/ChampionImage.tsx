"use client";

import Image from "next/image";
import { useState } from "react";
import { championImageUrl } from "@/lib/ddragon";
import { useAssets } from "./AssetsProvider";
import { cn } from "@/lib/utils";

interface ChampionImageProps {
  championName: string;
  size?: number;
  level?: number;
  className?: string;
  /** 원형(기본) / 둥근 사각형 */
  shape?: "circle" | "rounded";
  ring?: "win" | "lose" | "none";
}

export default function ChampionImage({ championName, size = 48, level, className = "", shape = "circle", ring = "none" }: ChampionImageProps) {
  const [error, setError] = useState(false);
  const { version, champions } = useAssets();
  const koName = champions[championName] ?? championName;
  const radius = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      title={koName}
    >
      {error ? (
        <div className={cn("flex h-full w-full items-center justify-center bg-abyss-500 text-ink-300", radius)} style={{ fontSize: Math.max(10, size * 0.28) }}>
          {championName?.slice(0, 2)}
        </div>
      ) : (
        <Image
          src={championImageUrl(championName, version)}
          alt={koName}
          width={size}
          height={size}
          className={cn("h-full w-full object-cover", radius, ring === "win" && "ring-2 ring-win/70", ring === "lose" && "ring-2 ring-lose/70")}
          style={{ transform: "scale(1.08)" }}
          onError={() => setError(true)}
          unoptimized
        />
      )}
      {level !== undefined && (
        <span
          className="num absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-frost-300/30 bg-abyss-900 px-1 text-[10px] font-bold text-frost-100"
        >
          {level}
        </span>
      )}
    </div>
  );
}
