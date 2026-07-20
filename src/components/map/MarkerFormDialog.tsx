import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOM_ICONS, MARKER_GROUPS, findGroup } from "@/lib/mapData";
import type { DbMarker } from "./MapView";

type Payload = {
  group_key: string;
  type_key: string;
  name: string;
  note: string;
  icon: string | null;
};

type Props = {
  open: boolean;
  title: string;
  initial?: DbMarker;
  onOpenChange: (o: boolean) => void;
  onSubmit: (payload: Payload) => void;
};

export default function MarkerFormDialog({
  open,
  title,
  initial,
  onOpenChange,
  onSubmit,
}: Props) {
  const [groupKey, setGroupKey] = useState(initial?.group_key ?? "locations");
  const [typeKey, setTypeKey] = useState(initial?.type_key ?? "city");
  const [name, setName] = useState(initial?.name ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [icon, setIcon] = useState<string>(initial?.icon ?? "⭐");

  useEffect(() => {
    if (open) {
      setGroupKey(initial?.group_key ?? "locations");
      setTypeKey(initial?.type_key ?? "city");
      setName(initial?.name ?? "");
      setNote(initial?.note ?? "");
      setIcon(initial?.icon ?? "⭐");
    }
  }, [open, initial]);

  const currentGroup = findGroup(groupKey);
  const isCustom = groupKey === "custom";

  const handleGroupChange = (v: string) => {
    setGroupKey(v);
    const g = findGroup(v);
    if (g && g.types[0]) setTypeKey(g.types[0].key);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (isCustom && !trimmed) return;
    const typeName =
      currentGroup?.types.find((tt) => tt.key === typeKey)?.name ?? "";
    const finalName = trimmed || typeName;
    if (!finalName) return;
    onSubmit({
      group_key: groupKey,
      type_key: isCustom ? "custom" : typeKey,
      name: finalName,
      note: note.trim(),
      icon: isCustom ? icon : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[1100] max-w-md border-2 border-[#7a5c2e] bg-[#2b1e12] text-[#f2d9a4]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-[#e0c893]">Grupo</Label>
            <Select value={groupKey} onValueChange={handleGroupChange}>
              <SelectTrigger className="mt-1 border-[#7a5c2e] bg-[#1f150c] text-[#f2d9a4]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[1200] border-[#7a5c2e] bg-[#2b1e12] text-[#f2d9a4]">
                {MARKER_GROUPS.map((g) => (
                  <SelectItem key={g.key} value={g.key}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isCustom && currentGroup && (
            <div>
              <Label className="text-[#e0c893]">Tipo</Label>
              <Select value={typeKey} onValueChange={setTypeKey}>
                <SelectTrigger className="mt-1 border-[#7a5c2e] bg-[#1f150c] text-[#f2d9a4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1200] border-[#7a5c2e] bg-[#2b1e12] text-[#f2d9a4]">
                  {currentGroup.types.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.icon} {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isCustom && (
            <div>
              <Label className="text-[#e0c893]">Icono</Label>
              <div className="mt-1 grid max-h-40 grid-cols-8 gap-1 overflow-auto rounded border border-[#7a5c2e] bg-[#1f150c] p-2">
                {CUSTOM_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`flex h-8 w-8 items-center justify-center rounded text-lg transition-colors ${
                      icon === ic ? "bg-[#c9a96a] text-[#1a1410]" : "hover:bg-[#3d2a19]"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-[#e0c893]">
              Nombre {isCustom ? "" : <span className="text-[#8a6e42]">(opcional)</span>}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 border-[#7a5c2e] bg-[#1f150c] text-[#f2d9a4]"
              placeholder={isCustom ? "Nombre del marcador" : "Si se deja vacío, se usa el nombre del tipo"}
              autoFocus
            />
          </div>

          <div>
            <Label className="text-[#e0c893]">Nota</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 border-[#7a5c2e] bg-[#1f150c] text-[#f2d9a4]"
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#7a5c2e] bg-transparent text-[#f2d9a4] hover:bg-[#3d2a19] hover:text-[#f2d9a4]"
          >
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={isCustom && !name.trim()}
            className="bg-[#c9a96a] text-[#1a1410] hover:bg-[#d4b878]"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
