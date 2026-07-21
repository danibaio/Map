import { MARKER_GROUPS } from "@/lib/mapData";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  activeGroups: Record<string, boolean>;
  activeTypes: Record<string, boolean>;
  onChangeGroup: (key: string, v: boolean) => void;
  onChangeType: (groupKey: string, typeKey: string, v: boolean) => void;
  onClose: () => void;
};

export default function FilterPanel({
  activeGroups,
  activeTypes,
  onChangeGroup,
  onChangeType,
  onClose,
}: Props) {
  return (
    <aside className="absolute left-4 top-32 z-[850] w-72 rounded-sm border-2 border-[#7a1414] bg-black/92 shadow-[0_0_25px_rgba(184,26,26,0.35)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b-2 border-[#7a1414] bg-gradient-to-r from-[#2a0a0a] via-black to-[#2a0a0a] px-3 py-2">
        <h2 className="font-serif text-lg font-black uppercase tracking-widest text-[#e8dfd0]">
          ⚔ Filtros
        </h2>
        <button
          onClick={onClose}
          className="text-[#b81a1a] transition-colors hover:text-[#e8dfd0]"
          aria-label="Cerrar filtros"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)] px-3 py-2">
        <div className="space-y-3">
          {MARKER_GROUPS.map((g) => {
            const gActive = activeGroups[g.key];
            return (
              <div
                key={g.key}
                className="rounded-sm border border-[#3a1414] bg-black/70 p-2 shadow-inner"
              >
                <label className="flex cursor-pointer items-center gap-2 border-b border-[#3a1414] pb-2">
                  <Checkbox
                    checked={gActive}
                    onCheckedChange={(v) => onChangeGroup(g.key, v === true)}
                    className="border-[#7a1414] data-[state=checked]:bg-[#b81a1a] data-[state=checked]:text-black"
                  />
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-[#7a1414]"
                    style={{ background: g.color }}
                  />
                  <span className="font-serif font-bold uppercase tracking-wider text-[#e8dfd0]">
                    {g.name}
                  </span>
                </label>
                <div className="mt-2 space-y-1 pl-2">
                  {g.types.map((t) => {
                    const key = `${g.key}:${t.key}`;
                    return (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={activeTypes[key]}
                          onCheckedChange={(v) => onChangeType(g.key, t.key, v === true)}
                          className="border-[#7a1414] data-[state=checked]:bg-[#b81a1a] data-[state=checked]:text-black"
                        />
                        <span>{t.icon}</span>
                        <span className="text-[#c8bfae]">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t-2 border-[#7a1414] bg-gradient-to-r from-[#2a0a0a] via-black to-[#2a0a0a] p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-2 border-[#7a1414] bg-black font-serif uppercase tracking-widest text-[#e8dfd0] hover:bg-[#2a0a0a] hover:text-[#fff]"
          onClick={() => {
            for (const g of MARKER_GROUPS) onChangeGroup(g.key, true);
          }}
        >
          Activar todos
        </Button>
      </div>
    </aside>
  );
}
