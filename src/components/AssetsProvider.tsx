"use client";

import { createContext, useContext } from "react";
import { AssetBundle } from "@/types/riot";
import { FALLBACK_DD_VERSION } from "@/lib/ddragon";

const EMPTY: AssetBundle = { version: FALLBACK_DD_VERSION, champions: {}, items: {}, spells: {}, runes: {} };

const Ctx = createContext<AssetBundle>(EMPTY);

export function useAssets() {
  return useContext(Ctx);
}

export default function AssetsProvider({ assets, children }: { assets: AssetBundle; children: React.ReactNode }) {
  return <Ctx.Provider value={assets}>{children}</Ctx.Provider>;
}
