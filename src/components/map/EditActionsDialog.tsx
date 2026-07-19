import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X } from "lucide-react";
import type { DbMarker } from "./MapView";
import { iconFor } from "@/lib/mapData";

type Props = {
  marker: DbMarker | null;
  onOpenChange: (o: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function EditActionsDialog({ marker, onOpenChange, onEdit, onDelete }: Props) {
  return (
    <Dialog open={marker !== null} onOpenChange={onOpenChange}>
      <DialogContent className="z-[1100] max-w-sm border-2 border-[#7a5c2e] bg-[#2b1e12] text-[#f2d9a4]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-lg">
            {marker && (
              <>
                <span>{iconFor(marker.group_key, marker.type_key, marker.icon)}</span>
                <span>{marker.name}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#c9a96a]">
          Arrastra el marcador sobre el mapa para cambiarlo de sitio, o usa una acción:
        </p>
        <div className="grid gap-2">
          <Button
            onClick={onEdit}
            className="justify-start bg-[#c9a96a] text-[#1a1410] hover:bg-[#d4b878]"
          >
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="justify-start bg-[#8b3a3a] hover:bg-[#a04545]"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="justify-start border-[#7a5c2e] bg-transparent text-[#f2d9a4] hover:bg-[#3d2a19] hover:text-[#f2d9a4]"
          >
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
