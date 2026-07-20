import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { toast } from "sonner";

import mapAsset from "@/assets/map.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { MARKER_GROUPS, iconFor } from "@/lib/mapData";
import FilterPanel from "./FilterPanel";
import MarkerFormDialog from "./MarkerFormDialog";
import EditActionsDialog from "./EditActionsDialog";
import PasswordDialog from "./PasswordDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, LockOpen, Menu, Search, X } from "lucide-react";

export type DbMarker = {
  id: string;
  group_key: string;
  type_key: string;
  name: string;
  note: string | null;
  icon: string | null;
  x: number;
  y: number;
  created_at?: string;
};

// El mapa usa coordenadas simples basadas en la imagen.
const IMG_W = 1920;
const IMG_H = 1920;
const BOUNDS: L.LatLngBoundsExpression = [
  [0, 0],
  [IMG_H, IMG_W],
];

// Builds a Leaflet DivIcon with an emoji, medieval-styled.
function buildIcon(emoji: string, color: string) {
  return L.divIcon({
    className: "custom-map-marker",
    html: `<div class="marker-pin" style="--pin-color:${color}"><span>${emoji}</span></div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 40],
    popupAnchor: [0, -36],
  });
}

// Componente para capturar clicks en el mapa cuando estamos en modo edición.
function MapClickHandler({
  editMode,
  onMapClick,
}: {
  editMode: boolean;
  onMapClick: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      if (!editMode) return;
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Componente para hacer zoom/centrar en un marcador buscado.
function FlyToController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, Math.max(map.getZoom(), 1), { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

export default function MapView() {
  const [markers, setMarkers] = useState<DbMarker[]>([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [askPassword, setAskPassword] = useState(false);

  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MARKER_GROUPS.map((g) => [g.key, true])),
  );
  const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const g of MARKER_GROUPS) for (const t of g.types) o[`${g.key}:${t.key}`] = true;
    return o;
  });

  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  // Estado para crear un marcador nuevo en un punto concreto del mapa.
  const [newAt, setNewAt] = useState<{ x: number; y: number } | null>(null);
  // Estado para el menú de acciones sobre un marcador existente.
  const [actionOn, setActionOn] = useState<DbMarker | null>(null);
  // Estado para editar un marcador existente.
  const [editing, setEditing] = useState<DbMarker | null>(null);

  const mapRef = useRef<L.Map | null>(null);

  // Carga inicial + realtime
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("markers")
        .select("*")
        .order("created_at", { ascending: true });
      if (!mounted) return;
      if (error) {
        toast.error("Error cargando marcadores: " + error.message);
      } else {
        setMarkers((data ?? []) as DbMarker[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("markers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "markers" },
        (payload) => {
          setMarkers((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as DbMarker;
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, row];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as DbMarker;
              return prev.map((m) => (m.id === row.id ? row : m));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as DbMarker;
              return prev.filter((m) => m.id !== row.id);
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrado real: si el grupo o el tipo está desactivado, no se renderiza.
  const visibleMarkers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return markers.filter((m) => {
      if (!activeGroups[m.group_key]) return false;
      if (!activeTypes[`${m.group_key}:${m.type_key}`]) return false;
      if (q) {
        const hay = `${m.name} ${m.note ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [markers, activeGroups, activeTypes, search]);

  // Resultados de búsqueda para el desplegable.
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return markers
      .filter((m) => `${m.name} ${m.note ?? ""}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [markers, search]);

  const handleMapClick = (latlng: L.LatLng) => {
    setNewAt({ x: latlng.lng, y: latlng.lat });
  };

  const handleCreate = async (payload: {
    group_key: string;
    type_key: string;
    name: string;
    note: string;
    icon: string | null;
  }) => {
    if (!newAt) return;
    const { error } = await supabase.from("markers").insert({
      ...payload,
      x: newAt.x,
      y: newAt.y,
    });
    if (error) {
      toast.error("No se pudo crear: " + error.message);
      return;
    }
    toast.success("Marcador creado");
    setNewAt(null);
  };

  const handleUpdate = async (
    id: string,
    payload: {
      group_key: string;
      type_key: string;
      name: string;
      note: string;
      icon: string | null;
    },
  ) => {
    const { error } = await supabase
      .from("markers")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("No se pudo guardar: " + error.message);
      return;
    }
    toast.success("Marcador actualizado");
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este marcador definitivamente?")) return;
    const { error } = await supabase.from("markers").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar: " + error.message);
      return;
    }
    toast.success("Marcador eliminado");
    setActionOn(null);
  };

  const handleDragEnd = async (id: string, latlng: L.LatLng) => {
    const { error } = await supabase
      .from("markers")
      .update({ x: latlng.lng, y: latlng.lat, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("No se pudo mover: " + error.message);
    } else {
      toast.success("Posición guardada");
    }
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
      toast("Modo edición desactivado");
    } else {
      setAskPassword(true);
    }
  };

  const handlePasswordSubmit = (pwd: string) => {
    if (pwd === "0106") {
      setEditMode(true);
      setAskPassword(false);
      toast.success("Modo edición activado");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1410]">
      {/* Header medieval */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[900] flex items-start justify-between p-4">
        <div className="pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            className="border-[#7a5c2e] bg-[#2b1e12]/90 text-[#f2d9a4] hover:bg-[#3d2a19] hover:text-[#fff4d6]"
            onClick={() => setShowFilters((s) => !s)}
          >
            <Menu className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>

        <div className="pointer-events-none flex-1 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-wider text-[#f2d9a4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-4xl">
            ⚔ Escuadrón de las Sombras ⚔
          </h1>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {editMode && (
            <span className="rounded-md border border-[#c9a96a] bg-[#3d2a19]/95 px-3 py-1.5 text-sm font-semibold text-[#f2d9a4] shadow-lg">
              ✎ Modo edición
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-[#7a5c2e] bg-[#2b1e12]/90 text-[#f2d9a4] hover:bg-[#3d2a19] hover:text-[#fff4d6]"
            onClick={handleToggleEditMode}
          >
            {editMode ? <LockOpen className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {editMode ? "Salir" : "Modo edición"}
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="absolute left-1/2 top-20 z-[900] w-[92%] max-w-md -translate-x-1/2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a6e42]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar marcador..."
            className="border-[#7a5c2e] bg-[#2b1e12]/95 pl-9 text-[#f2d9a4] placeholder:text-[#8a6e42] focus-visible:ring-[#c9a96a]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8a6e42] hover:text-[#f2d9a4]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {searchResults.length > 0 && (
            <div className="absolute inset-x-0 top-full mt-1 max-h-64 overflow-auto rounded-md border border-[#7a5c2e] bg-[#2b1e12]/98 shadow-2xl">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setFlyTarget([r.y, r.x]);
                    setSearch("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#f2d9a4] hover:bg-[#3d2a19]"
                >
                  <span>{iconFor(r.group_key, r.type_key, r.icon)}</span>
                  <span className="flex-1 truncate">{r.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <FilterPanel
          activeGroups={activeGroups}
          activeTypes={activeTypes}
          onChangeGroup={(key, v) => {
            setActiveGroups((prev) => ({ ...prev, [key]: v }));
            // Al activar/desactivar un grupo, también actualizamos sus tipos.
            setActiveTypes((prev) => {
              const next = { ...prev };
              const g = MARKER_GROUPS.find((g) => g.key === key);
              if (g) for (const t of g.types) next[`${key}:${t.key}`] = v;
              return next;
            });
          }}
          onChangeType={(gkey, tkey, v) =>
            setActiveTypes((prev) => ({ ...prev, [`${gkey}:${tkey}`]: v }))
          }
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Mapa Leaflet */}
      <MapContainer
        crs={L.CRS.Simple}
        bounds={BOUNDS}
        maxBounds={[
          [-200, -200],
          [IMG_H + 200, IMG_W + 200],
        ]}
        minZoom={-2}
        maxZoom={3}
        zoom={-1}
        className="h-full w-full"
        attributionControl={false}
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
        style={{ background: "#1a1410" }}
      >
        <ImageOverlay url={mapAsset.url} bounds={BOUNDS} />
        <MapClickHandler editMode={editMode} onMapClick={handleMapClick} />
        <FlyToController target={flyTarget} />

        {visibleMarkers.map((m) => {
          const group = MARKER_GROUPS.find((g) => g.key === m.group_key);
          const emoji = iconFor(m.group_key, m.type_key, m.icon);
          const color = group?.color ?? "#c9a96a";
          return (
            <Marker
              key={m.id}
              position={[m.y, m.x]}
              icon={buildIcon(emoji, color)}
              draggable={editMode}
              eventHandlers={{
                click: () => {
                  if (editMode) setActionOn(m);
                },
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng();
                  handleDragEnd(m.id, ll);
                },
              }}
            >
              {!editMode && (
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 font-serif text-base font-bold">
                      <span>{emoji}</span>
                      <span>{m.name}</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {group?.name} ·{" "}
                      {m.group_key === "custom"
                        ? "Personalizado"
                        : group?.types.find((t) => t.key === m.type_key)?.name}
                    </div>
                    {m.note && <p className="mt-2 whitespace-pre-wrap text-sm">{m.note}</p>}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {/* Autor */}
      <div className="pointer-events-none absolute bottom-3 right-4 z-[900] rounded-md border border-[#7a5c2e] bg-[#2b1e12]/90 px-3 py-1 font-serif text-xs text-[#c9a96a] shadow-lg">
        Creado por <span className="font-bold text-[#f2d9a4]">Hitt0</span>
      </div>

      {loading && (
        <div className="absolute inset-0 z-[800] flex items-center justify-center bg-[#1a1410]/80 text-[#f2d9a4]">
          Cargando mapa...
        </div>
      )}

      {/* Diálogos */}
      <PasswordDialog
        open={askPassword}
        onOpenChange={setAskPassword}
        onSubmit={handlePasswordSubmit}
      />

      <MarkerFormDialog
        open={newAt !== null}
        title="Nuevo marcador"
        onOpenChange={(o) => !o && setNewAt(null)}
        onSubmit={handleCreate}
      />

      <MarkerFormDialog
        open={editing !== null}
        title="Editar marcador"
        initial={editing ?? undefined}
        onOpenChange={(o) => !o && setEditing(null)}
        onSubmit={(payload) => editing && handleUpdate(editing.id, payload)}
      />

      <EditActionsDialog
        marker={actionOn}
        onOpenChange={(o) => !o && setActionOn(null)}
        onEdit={() => {
          setEditing(actionOn);
          setActionOn(null);
        }}
        onDelete={() => actionOn && handleDelete(actionOn.id)}
      />
    </div>
  );
}
