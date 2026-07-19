// Configuración de grupos, tipos e iconos disponibles para los marcadores.
// Los iconos son emojis para simplicidad y compatibilidad total sin descargas externas.

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

export const MARKER_GROUPS: MarkerGroup[] = [
  {
    key: "npcs",
    name: "NPCs",
    color: "#c9a96a",
    types: [
      { key: "wastrel", name: "Wastrel", icon: "🧟" },
      { key: "bandit", name: "Bandit", icon: "🏴‍☠️" },
      { key: "bay_wafa", name: "Bay Wafa", icon: "🧕" },
      { key: "merchant", name: "Mercader", icon: "💰" },
      { key: "guard", name: "Guardia", icon: "🛡️" },
      { key: "villager", name: "Aldeano", icon: "🧑" },
    ],
  },
  {
    key: "resources",
    name: "Recursos",
    color: "#8b6d3f",
    types: [
      { key: "wood", name: "Madera", icon: "🪵" },
      { key: "stone", name: "Piedra", icon: "🪨" },
      { key: "iron", name: "Hierro", icon: "⛏️" },
      { key: "gold", name: "Oro", icon: "🪙" },
      { key: "herbs", name: "Hierbas", icon: "🌿" },
      { key: "water", name: "Agua", icon: "💧" },
    ],
  },
  {
    key: "locations",
    name: "Ubicaciones",
    color: "#a67c3a",
    types: [
      { key: "city", name: "Ciudad", icon: "🏰" },
      { key: "village", name: "Aldea", icon: "🏘️" },
      { key: "camp", name: "Campamento", icon: "⛺" },
      { key: "ruins", name: "Ruinas", icon: "🏛️" },
      { key: "dungeon", name: "Mazmorra", icon: "🕳️" },
      { key: "shrine", name: "Santuario", icon: "⛩️" },
    ],
  },
  {
    key: "enemies",
    name: "Enemigos",
    color: "#8b3a3a",
    types: [
      { key: "boss", name: "Jefe", icon: "👹" },
      { key: "elite", name: "Élite", icon: "☠️" },
      { key: "mob", name: "Común", icon: "👺" },
      { key: "beast", name: "Bestia", icon: "🐺" },
      { key: "dragon", name: "Dragón", icon: "🐉" },
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
