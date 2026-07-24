import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Leaflet solo funciona en el navegador, por eso deshabilitamos SSR en esta ruta.
const MapView = lazy(() => import("@/components/map/MapView"));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mapa Interactivo" },
      {
        name: "description",
        content:
          "Mapa interactivo . Consulta ubicaciones, NPCs, recursos y enemigos.",
      },
      { property: "og:title", content: "Mapa Interactivo" },
      {
        property: "og:description",
        content: "Mapa interactivo. Consulta ubicaciones, NPCs, recursos y enemigos.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#1a1410] font-serif text-[#f2d9a4]">
          Cargando el mapa...
        </div>
      }
    >
      <MapView />
    </Suspense>
  );
}
