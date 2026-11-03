"use client";

import Image from "next/image";
import { useState } from "react";
import { runeImageUrl, runeImageUrlById } from "@/lib/ddragon";
import { useAssets } from "./AssetsProvider";
import Tooltip from "./ui/Tooltip";

export default function RuneIcon({ runeId, size = 22, keystone = false }: { runeId: number; size?: number; keystone?: boolean }) {
  const [error, setError] = useState(false);
  const { runes } = useAssets();
  const meta = runes[runeId];
  const src = meta ? runeImageUrl(meta.icon) : runeImageUrlById(runeId);

  if (!runeId || error) {
    return <div className="rounded-full border border-white/[0.06] bg-white/[0.03]" style={{ width: size, height: size }} />;
  }
  const img = (
    <Image
      src={src}
      alt={meta?.name ?? "룬"}
      width={size}
      height={size}
      className={`rounded-full ${keystone ? "bg-abyss-900" : "bg-abyss-900/60 p-0.5"}`}
      onError={() => setError(true)}
      unoptimized
    />
  );
  return meta ? <Tooltip content={<span className="font-bold text-frost-100">{meta.name}</span>}>{img}</Tooltip> : img;
}
