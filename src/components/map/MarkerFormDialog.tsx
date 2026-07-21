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

  const inputCls =
    "mt-1 border-[#7a1414] bg-[#0a0a0a] text-[#e8dfd0] focus-visible:ring-[#b81a1a]";
  const labelCls = "uppercase tracking-wider text-[#b81a1a]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[1100] max-w-md border-2 border-[#7a1414] bg-black text-[#e8dfd0] shadow-[0_0_30px_rgba(184,26,26,0.5)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl uppercase tracking-widest">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className={labelCls}>Grupo</Label>
            <Select value={groupKey} onValueChange={handleGroupChange}>
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[1200] border-[#7a1414] bg-black text-[#e8dfd0]">
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
              <Label className={labelCls}>Tipo</Label>
              <Select value={typeKey} onValueChange={setTypeKey}>
                <SelectTrigger className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1200] border-[#7a1414] bg-black text-[#e8dfd0]">
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
              <Label className={labelCls}>Icono</Label>
              <div className="mt-1 grid max-h-40 grid-cols-8 gap-1 overflow-auto rounded border border-[#7a1414] bg-[#0a0a0a] p-2">
                {CUSTOM_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`flex h-8 w-8 items-center justify-center rounded text-lg transition-colors ${
                      icon === ic
                        ? "bg-[#b81a1a] text-black"
                        : "hover:bg-[#2a0a0a]"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className={labelCls}>
              Nombre {isCustom ? "" : <span className="text-[#6b5a4a]">(opcional)</span>}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder={isCustom ? "Nombre del marcador" : "Si se deja vacío, se usa el nombre del tipo"}
              autoFocus
            />
          </div>

          <div>
            <Label className={labelCls}>Nota</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputCls}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 border-[#3a1414] bg-transparent text-[#e8dfd0] hover:bg-[#2a0a0a] hover:text-[#e8dfd0]"
          >
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={isCustom && !name.trim()}
            className="bg-[#b81a1a] font-bold uppercase tracking-wider text-[#e8dfd0] hover:bg-[#d42020]"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
