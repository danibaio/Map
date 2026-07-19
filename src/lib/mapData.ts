// Configuración de grupos, tipos e iconos disponibles para los marcadores.

export type MarkerType = {
  key: string;
  name: string;
  icon: string;
};

export type MarkerGroup = {
  key: string;
  name: string;
  color: string;
  types: MarkerType[];
};

export const CUSTOM_ICONS: string[] = [
  "⭐", "🏰", "⚔️", "🛡️", "🏹", "🗡️", "🪓", "🔱",
  "💰", "💎", "🗝️", "📜", "🕯️", "🔥", "❄️", "⚡",
  "🐉", "🐺", "🕷️", "🦇", "☠️", "👑", "🏴‍☠️", "🧙",
  "🍖", "🍺", "🌿", "🌲", "⛰️", "🏔️", "🌊", "🕳️",
];

const t = (name: string, icon: string): MarkerType => ({
  key: name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
  name,
  icon,
});

export const MARKER_GROUPS: MarkerGroup[] = [
  {
    key: "npcs",
    name: "NPCs",
    color: "#c9a96a",
    types: [
      t("Wastrel", "🧟"),
      t("Bandit", "🏴‍☠️"),
      t("Bay Wafa", "🧕"),
      t("Taskmaster", "🧑‍✈️"),
    ],
  },
  {
    key: "animals",
    name: "Animals",
    color: "#8b6d3f",
    types: [
      t("Akrep", "🦂"),
      t("Ruah Gamal", "🐫"),
      t("Ratzar Alete", "🐜"),
      t("Ratzar Worker", "🐜"),
      t("Ratzar Hunter", "🐜"),
      t("Crocodile", "🐊"),
      t("Ratzar Feeder", "🐜"),
      t("Desert Horse", "🐎"),
      t("Giant Akrep", "🦂"),
      t("Golden Danaburu", "🐢"),
      t("Water Lizard", "🦎"),
      t("Camopdon", "🦕"),
      t("Danaburnu", "🐢"),
      t("Gembok", "🐐"),
      t("Hunter Lizard", "🦎"),
      t("Jungle Horse", "🐴"),
      t("Koch Gamal", "🐫"),
      t("Stone Lizard", "🦎"),
      t("Panther", "🐆"),
      t("Ratzar Queen", "👑"),
      t("Ibex", "🐐"),
      t("Bush Pig", "🐗"),
      t("Terror Bird", "🦤"),
      t("Cluster", "🕸️"),
      t("Ormek", "🐍"),
      t("Springbok", "🦌"),
    ],
  },
  {
    key: "fish",
    name: "Fish",
    color: "#4a7ba6",
    types: [
      t("Bassile", "🐟"),
      t("Windfish", "🐠"),
      t("Mitten Crab", "🦀"),
      t("MeckEl", "🐟"),
      t("Quert", "🐟"),
      t("Durp", "🐟"),
      t("Conger Eel", "🐍"),
      t("Rodspine", "🐡"),
      t("Crab", "🦀"),
      t("Stream", "🌊"),
      t("Laake", "🐟"),
      t("Gutta", "💧"),
      t("Canna", "🎣"),
      t("Herberus", "🐟"),
      t("Bluefish", "🐟"),
      t("Tailfish", "🐠"),
    ],
  },
  {
    key: "wood",
    name: "Wood",
    color: "#6b4423",
    types: [
      t("Whitewood", "🪵"),
      t("Brownwood", "🪵"),
      t("Stonewood", "🪵"),
    ],
  },
  {
    key: "flora",
    name: "Flora",
    color: "#4a7c3a",
    types: [
      t("Sea Dew", "🌱"),
      t("Aloe", "🌵"),
      t("Drakon", "🌿"),
      t("Spargia Reed", "🌾"),
      t("Yellow Cepa", "🧅"),
      t("Palm Fruit", "🌴"),
      t("Green Spicca", "🌿"),
      t("Muse Fruit", "🍌"),
    ],
  },
  {
    key: "ore",
    name: "Ore",
    color: "#8a8a8a",
    types: [
      t("Bor", "⚗️"),
      t("Sweat Salt", "🧂"),
      t("Salt", "🧂"),
      t("Granum", "🪨"),
      t("Nitre", "💥"),
      t("Calamine", "🪨"),
      t("Calx", "🪨"),
      t("Iron", "⛏️"),
    ],
  },
  {
    key: "temples",
    name: "Temples",
    color: "#b8860b",
    types: [
      t("Temple", "⛩️"),
    ],
  },
  {
    key: "landmarks",
    name: "Landmarks",
    color: "#a67c3a",
    types: [
      t("Point of Interest", "📍"),
      t("Oasis", "🏝️"),
      t("Dungeon", "🕳️"),
      t("Bandit Camp", "🏴‍☠️"),
      t("Camp", "⛺"),
      t("Old Camp", "🏕️"),
      t("Vendor", "💰"),
      t("SandWorm", "🐛"),
      t("Ruins", "🏛️"),
      t("Sulfur", "🔥"),
      t("Graveyard", "⚰️"),
      t("Crater", "🌋"),
      t("Bridge", "🌉"),
    ],
  },
  {
    key: "item_spawns",
    name: "Item Spawns",
    color: "#d4af37",
    types: [
      t("Chests", "🧰"),
      t("Chest", "📦"),
      t("Barrel", "🛢️"),
    ],
  },
  {
    key: "custom",
    name: "Personalizado",
    color: "#d4af37",
    types: [
      { key: "custom", name: "Personalizado", icon: "⭐" },
    ],
  },
];

export function findGroup(key: string): MarkerGroup | undefined {
  return MARKER_GROUPS.find((g) => g.key === key);
}

export function findType(groupKey: string, typeKey: string): MarkerType | undefined {
  return findGroup(groupKey)?.types.find((t) => t.key === typeKey);
}

export function iconFor(groupKey: string, typeKey: string, custom?: string | null): string {
  if (groupKey === "custom") return custom || "⭐";
  return findType(groupKey, typeKey)?.icon || "📍";
}
