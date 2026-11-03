import { AssetBundle, Match } from "@/types/riot";

const DD_BASE = "https://ddragon.leagueoflegends.com";
export const FALLBACK_DD_VERSION = "14.13.1";

const REVALIDATE = 60 * 60 * 6; // 6시간

async function ddFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${DD_BASE}${path}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 최신 데이터 드래곤 버전 (실패 시 fallback) */
export async function getLatestVersion(): Promise<string> {
  const versions = await ddFetch<string[]>("/api/versions.json");
  return versions?.[0] ?? FALLBACK_DD_VERSION;
}

interface RawItemJson {
  data: Record<string, { name: string; plaintext?: string }>;
}
interface RawChampionJson {
  data: Record<string, { id: string; key: string; name: string }>;
}
interface RawSpellJson {
  data: Record<string, { id: string; key: string; name: string }>;
}
interface RawRuneStyle {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: Array<{ runes: Array<{ id: number; name: string; icon: string }> }>;
}

type FullCatalog = {
  items: Record<number, { name: string; plaintext: string }>;
  champions: Record<string, string>;
  spells: Record<number, { id: string; name: string }>;
  runes: Record<number, { name: string; icon: string }>;
};

const catalogCache = new Map<string, Promise<FullCatalog>>();

async function loadCatalog(version: string): Promise<FullCatalog> {
  const [items, champions, spells, runes] = await Promise.all([
    ddFetch<RawItemJson>(`/cdn/${version}/data/ko_KR/item.json`),
    ddFetch<RawChampionJson>(`/cdn/${version}/data/ko_KR/champion.json`),
    ddFetch<RawSpellJson>(`/cdn/${version}/data/ko_KR/summoner.json`),
    ddFetch<RawRuneStyle[]>(`/cdn/${version}/data/ko_KR/runesReforged.json`),
  ]);

  const catalog: FullCatalog = { items: {}, champions: {}, spells: {}, runes: {} };

  if (items) {
    for (const [id, item] of Object.entries(items.data)) {
      catalog.items[Number(id)] = { name: item.name, plaintext: item.plaintext ?? "" };
    }
  }
  if (champions) {
    for (const champ of Object.values(champions.data)) {
      catalog.champions[champ.id] = champ.name;
    }
  }
  if (spells) {
    for (const spell of Object.values(spells.data)) {
      catalog.spells[Number(spell.key)] = { id: spell.id, name: spell.name };
    }
  }
  if (runes) {
    for (const style of runes) {
      catalog.runes[style.id] = { name: style.name, icon: style.icon };
      for (const slot of style.slots) {
        for (const rune of slot.runes) {
          catalog.runes[rune.id] = { name: rune.name, icon: rune.icon };
        }
      }
    }
  }
  return catalog;
}

function getCatalog(version: string): Promise<FullCatalog> {
  let cached = catalogCache.get(version);
  if (!cached) {
    cached = loadCatalog(version).catch(() => ({ items: {}, champions: {}, spells: {}, runes: {} }));
    catalogCache.set(version, cached);
  }
  return cached;
}

/**
 * 매치 목록에 실제로 등장하는 아이템/챔피언/스펠/룬만 추려 클라이언트에 보낼 번들을 만든다.
 * (전체 item.json 은 수백 KB 라서 그대로 내려주지 않는다)
 */
export async function buildAssetBundle(matches: Match[], version?: string): Promise<AssetBundle> {
  const v = version ?? (await getLatestVersion());
  const catalog = await getCatalog(v);

  const bundle: AssetBundle = { version: v, champions: {}, items: {}, spells: {}, runes: {} };

  for (const match of matches) {
    for (const p of match.info.participants) {
      if (catalog.champions[p.championName]) bundle.champions[p.championName] = catalog.champions[p.championName];
      for (const itemId of [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6]) {
        if (itemId && catalog.items[itemId]) bundle.items[itemId] = catalog.items[itemId];
      }
      for (const spellId of [p.summoner1Id, p.summoner2Id]) {
        if (catalog.spells[spellId]) bundle.spells[spellId] = catalog.spells[spellId];
      }
      for (const runeId of [p.keystoneId, p.secondaryStyleId]) {
        if (catalog.runes[runeId]) bundle.runes[runeId] = catalog.runes[runeId];
      }
    }
  }
  return bundle;
}

export function mergeAssetBundles(a: AssetBundle, b: AssetBundle): AssetBundle {
  return {
    version: a.version || b.version,
    champions: { ...a.champions, ...b.champions },
    items: { ...a.items, ...b.items },
    spells: { ...a.spells, ...b.spells },
    runes: { ...a.runes, ...b.runes },
  };
}

// ---------- 이미지 URL ----------
export function championImageUrl(championName: string, version: string): string {
  return `${DD_BASE}/cdn/${version}/img/champion/${championName}.png`;
}
export function championSplashUrl(championName: string): string {
  return `${DD_BASE}/cdn/img/champion/splash/${championName}_0.jpg`;
}
export function profileIconUrl(iconId: number, version: string): string {
  return `${DD_BASE}/cdn/${version}/img/profileicon/${iconId}.png`;
}
export function itemImageUrl(itemId: number, version: string): string {
  return `${DD_BASE}/cdn/${version}/img/item/${itemId}.png`;
}
export function spellImageUrl(spellKey: string, version: string): string {
  return `${DD_BASE}/cdn/${version}/img/spell/${spellKey}.png`;
}
export function spellImageUrlById(spellId: number): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/${spellId}.png`;
}
export function runeImageUrl(iconPath: string): string {
  return `${DD_BASE}/cdn/img/${iconPath}`;
}
export function runeImageUrlById(perkId: number): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-icons/${perkId}.png`;
}
