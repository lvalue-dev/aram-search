"use client";

import Image from "next/image";
import { useState } from "react";
import { getItemImageUrl } from "@/lib/utils";

interface ItemSlotProps {
  itemId: number;
  size?: number;
}

export default function ItemSlot({ itemId, size = 28 }: ItemSlotProps) {
  const [error, setError] = useState(false);

  if (!itemId || itemId === 0) {
    return (
      <div
        className="rounded bg-white/5 border border-white/5"
        style={{ width: size, height: size }}
      />
    );
  }

  if (error) {
    return (
      <div
        className="rounded bg-white/5 border border-white/5"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      src={getItemImageUrl(itemId)}
      alt={`item-${itemId}`}
      width={size}
      height={size}
      className="rounded border border-white/10"
      onError={() => setError(true)}
    />
  );
}
