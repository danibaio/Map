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
    <aside className="absolute left-4 top-32 z-[850] w-72 rounded-md border-2 border-[#7a5c2e] bg-[#2b1e12]/97 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#7a5c2e] px-3 py-2">
        <h2 className="font-serif text-lg font-bold text-[#f2d9a4]">Filtros</h2>
        <button
          onClick={onClose}
          className="text-[#8a6e42] hover:text-[#f2d9a4]"
          aria-label="Cerrar filtros"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)] px-3 py-2">
        <div className="space-y-4">
          {MARKER_GROUPS.map((g) => {
            const gActive = activeGroups[g.key];
            return (
              <div key={g.key} className="rounded border border-[#5a4322] bg-[#1f150c]/60 p-2">
                <label className="flex cursor-pointer items-center gap-2 border-b border-[#5a4322] pb-2">
                  <Checkbox
                    checked={gActive}
                    onCheckedChange={(v) => onChangeGroup(g.key, v === true)}
                    className="border-[#7a5c2e] data-[state=checked]:bg-[#c9a96a] data-[state=checked]:text-[#1a1410]"
                  />
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: g.color }}
                  />
                  <span className="font-serif font-bold text-[#f2d9a4]">{g.name}</span>
                </label>
                <div className="mt-2 space-y-1 pl-2">
                  {g.types.map((t) => {
                    const key = `${g.key}:${t.key}`;
                    return (
                      <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={activeTypes[key]}
                          onCheckedChange={(v) => onChangeType(g.key, t.key, v === true)}
                          className="border-[#7a5c2e] data-[state=checked]:bg-[#c9a96a] data-[state=checked]:text-[#1a1410]"
                        />
                        <span>{t.icon}</span>
                        <span className="text-[#e0c893]">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t border-[#7a5c2e] p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-[#7a5c2e] bg-[#3d2a19] text-[#f2d9a4] hover:bg-[#4d3620]"
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
