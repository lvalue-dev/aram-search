"use client";

import Image from "next/image";
import { useState } from "react";
import { itemImageUrl } from "@/lib/ddragon";
import { useAssets } from "./AssetsProvider";
import Tooltip from "./ui/Tooltip";

interface ItemSlotProps {
  itemId: number;
  size?: number;
  trinket?: boolean;
}

export default function ItemSlot({ itemId, size = 28, trinket = false }: ItemSlotProps) {
  const [error, setError] = useState(false);
  const { version, items } = useAssets();
  const meta = items[itemId];

  if (!itemId || itemId === 0 || error) {
    return (
      <div
        className={`shrink-0 border border-white/[0.06] bg-white/[0.03] ${trinket ? "rounded-full" : "rounded-md"}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  const img = (
    <Image
      src={itemImageUrl(itemId, version)}
      alt={meta?.name ?? `아이템 ${itemId}`}
      width={size}
      height={size}
      className={`shrink-0 border border-white/10 bg-abyss-800 ${trinket ? "rounded-full" : "rounded-md"}`}
      onError={() => setError(true)}
      unoptimized
    />
  );

  if (!meta) return img;

  return (
    <Tooltip
      content={
        <div>
          <div className="font-bold text-frost-100">{meta.name}</div>
          {meta.plaintext && <div className="mt-0.5 text-[11px] leading-snug text-ink-300">{meta.plaintext}</div>}
        </div>
      }
    >
      {img}
    </Tooltip>
  );
}
