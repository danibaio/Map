import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { toast } from "sonner";

import mapAsset from "@/assets/mapa-final.png.asset.json";
import bgAsset from "@/assets/escuadron-fondo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { MARKER_GROUPS, iconFor } from "@/lib/mapData";
import FilterPanel from "./FilterPanel";
import MarkerFormDialog from "./MarkerFormDialog";
import EditActionsDialog from "./EditActionsDialog";
import PasswordDialog from "./PasswordDialog";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen, Swords } from "lucide-react";


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

const IMG_W = 1920;
const IMG_H = 1920;
const BOUNDS: L.LatLngBoundsExpression = [
  [0, 0],
  [IMG_H, IMG_W],
];

function buildIcon(emoji: string, color: string) {
  return L.divIcon({
    className: "custom-map-marker",
    html: `<div class="marker-pin" style="--pin-color:${color}"><span>${emoji}</span></div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 40],
    popupAnchor: [0, -36],
  });
}

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

function ZoomScaleTracker() {
  const map = useMapEvents({
    zoom() {
      applyScale();
    },
  });
  const applyScale = () => {
    const z = map.getZoom();
    // zoom range: -2 (out) .. 3 (in). Linear scale 0.3 -> 1.6
    const scale = Math.max(0.3, Math.min(1.6, 0.3 + (z + 2) * 0.26));
    const container = map.getContainer();
    container.style.setProperty("--marker-scale", scale.toFixed(3));
  };
  // apply on mount
  useEffect(() => {
    applyScale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}





export default function MapView() {
  const [markers, setMarkers] = useState<DbMarker[]>([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [askPassword, setAskPassword] = useState(false);
  const [askDeletePassword, setAskDeletePassword] = useState<DbMarker | null>(null);

  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MARKER_GROUPS.map((g) => [g.key, true])),
  );
  const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const g of MARKER_GROUPS) for (const t of g.types) o[`${g.key}:${t.key}`] = true;
    return o;
  });

  const [showFilters, setShowFilters] = useState(true);

  const [newAt, setNewAt] = useState<{ x: number; y: number } | null>(null);
  const [actionOn, setActionOn] = useState<DbMarker | null>(null);
  const [editing, setEditing] = useState<DbMarker | null>(null);

  const mapRef = useRef<L.Map | null>(null);

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

  const visibleMarkers = useMemo(() => {
    return markers.filter((m) => {
      if (!activeGroups[m.group_key]) return false;
      if (!activeTypes[`${m.group_key}:${m.type_key}`]) return false;
      return true;
    });
  }, [markers, activeGroups, activeTypes]);

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

  const FIVE_MIN_MS = 5 * 60 * 1000;

  const performDelete = async (id: string) => {
    const { error } = await supabase.from("markers").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar: " + error.message);
      return;
    }
    toast.success("Marcador eliminado");
    setActionOn(null);
    setAskDeletePassword(null);
  };

  const handleDelete = async (marker: DbMarker) => {
    const createdAt = marker.created_at ? new Date(marker.created_at).getTime() : 0;
    const age = Date.now() - createdAt;
    if (createdAt && age <= FIVE_MIN_MS) {
      if (!confirm("¿Eliminar este marcador definitivamente?")) return;
      await performDelete(marker.id);
      return;
    }
    setActionOn(null);
    setAskDeletePassword(marker);
  };

  const handleDeletePasswordSubmit = async (pwd: string) => {
    if (pwd !== "0107") {
      toast.error("Contraseña incorrecta");
      return;
    }
    if (askDeletePassword) await performDelete(askDeletePassword.id);
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
    <div
      className="relative h-screen w-screen overflow-hidden bg-black"
      style={{
        backgroundImage: `url(${bgAsset.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Esquina superior izquierda: botón Filtros + panel anclado */}
      <div className="absolute left-4 top-4 z-[900] w-64">
        <Button
          variant="outline"
          size="sm"
          className={`w-full justify-start border-2 border-[#7a1414] bg-black/90 font-serif tracking-widest text-[#e8dfd0] shadow-[0_0_12px_rgba(120,20,20,0.4)] hover:bg-[#2a0a0a] hover:text-[#fff] ${
            showFilters ? "rounded-b-none border-b-0" : ""
          }`}
          onClick={() => setShowFilters((s) => !s)}
        >
          <Swords className="mr-2 h-4 w-4 text-[#b81a1a]" />
          <span className="font-bold uppercase">Filtros</span>
        </Button>
        {showFilters && (
          <FilterPanel
            activeGroups={activeGroups}
            activeTypes={activeTypes}
            onChangeGroup={(key, v) => {
              setActiveGroups((prev) => ({ ...prev, [key]: v }));
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
          />
        )}
      </div>

      {/* Esquina superior derecha: modo edición */}
      <div className="absolute right-4 top-4 z-[900] flex items-center gap-2">
        {editMode && (
          <span className="rounded-sm border-2 border-[#b81a1a] bg-black/85 px-3 py-1.5 font-serif text-sm font-semibold uppercase tracking-wider text-[#e8dfd0] shadow-[0_0_12px_rgba(184,26,26,0.5)]">
            ✎ Edición
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-[#7a1414] bg-black/85 font-serif tracking-wider text-[#e8dfd0] shadow-[0_0_12px_rgba(120,20,20,0.4)] hover:bg-[#2a0a0a] hover:text-[#fff]"
          onClick={handleToggleEditMode}
        >
          {editMode ? <LockOpen className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
          {editMode ? "Salir" : "Modo edición"}
        </Button>
      </div>


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
        zoomControl={false}
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
        style={{ background: "transparent" }}
      >
        <ImageOverlay url={mapAsset.url} bounds={BOUNDS} />
        <MapClickHandler editMode={editMode} onMapClick={handleMapClick} />


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
      <div className="pointer-events-none absolute bottom-3 right-4 z-[900] rounded-sm border-2 border-[#7a1414] bg-black/85 px-3 py-1 font-serif text-xs uppercase tracking-widest text-[#e8dfd0] shadow-[0_0_10px_rgba(184,26,26,0.4)]">
        Creado por <span className="font-bold text-[#b81a1a]">Hitt0</span>
      </div>

      {loading && (
        <div className="absolute inset-0 z-[800] flex items-center justify-center bg-black/85 font-serif uppercase tracking-widest text-[#e8dfd0]">
          Cargando mapa...
        </div>
      )}

      <PasswordDialog
        open={askPassword}
        onOpenChange={setAskPassword}
        onSubmit={handlePasswordSubmit}
      />

      <PasswordDialog
        open={askDeletePassword !== null}
        onOpenChange={(o) => !o && setAskDeletePassword(null)}
        onSubmit={handleDeletePasswordSubmit}
        title="🗝 Eliminar marcador antiguo"
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
        onDelete={() => actionOn && handleDelete(actionOn)}
      />

    </div>
  );
}
