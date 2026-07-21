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
      <DialogContent className="z-[1100] max-w-sm border-2 border-[#7a1414] bg-black text-[#e8dfd0] shadow-[0_0_30px_rgba(184,26,26,0.5)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-lg uppercase tracking-wider">
            {marker && (
              <>
                <span>{iconFor(marker.group_key, marker.type_key, marker.icon)}</span>
                <span>{marker.name}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#c8bfae]">
          Arrastra el marcador sobre el mapa para cambiarlo de sitio, o usa una acción:
        </p>
        <div className="grid gap-2">
          <Button
            onClick={onEdit}
            className="justify-start bg-[#2a4a6b] font-semibold uppercase tracking-wider text-[#e8dfd0] hover:bg-[#365e88]"
          >
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="justify-start bg-[#b81a1a] font-semibold uppercase tracking-wider hover:bg-[#d42020]"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="justify-start border-2 border-[#3a1414] bg-transparent text-[#e8dfd0] hover:bg-[#2a0a0a] hover:text-[#e8dfd0]"
          >
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
