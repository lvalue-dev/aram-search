"use client";

import Image from "next/image";
import { useState } from "react";
import { spellImageUrl, spellImageUrlById } from "@/lib/ddragon";
import { useAssets } from "./AssetsProvider";
import Tooltip from "./ui/Tooltip";

export default function SpellIcon({ spellId, size = 22 }: { spellId: number; size?: number }) {
  const [error, setError] = useState(false);
  const { version, spells } = useAssets();
  const meta = spells[spellId];
  const src = meta ? spellImageUrl(meta.id, version) : spellImageUrlById(spellId);

  if (!spellId || error) {
    return <div className="rounded-md border border-white/[0.06] bg-white/[0.03]" style={{ width: size, height: size }} />;
  }
  const img = (
    <Image src={src} alt={meta?.name ?? "스펠"} width={size} height={size} className="rounded-md border border-white/10" onError={() => setError(true)} unoptimized />
  );
  return meta ? <Tooltip content={<span className="font-bold text-frost-100">{meta.name}</span>}>{img}</Tooltip> : img;
}
