import { useState } from "react";
import { MARKER_GROUPS } from "@/lib/mapData";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";


type Props = {
  activeGroups: Record<string, boolean>;
  activeTypes: Record<string, boolean>;
  onChangeGroup: (key: string, v: boolean) => void;
  onChangeType: (groupKey: string, typeKey: string, v: boolean) => void;
};

export default function FilterPanel({
  activeGroups,
  activeTypes,
  onChangeGroup,
  onChangeType,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const setAll = (v: boolean) => {
    for (const g of MARKER_GROUPS) onChangeGroup(g.key, v);
  };

  return (
    <aside className="w-64 rounded-sm border-2 border-[#7a1414] bg-black/92 shadow-[0_0_25px_rgba(184,26,26,0.35)] backdrop-blur-sm">
      {/* Conector visual con el botón de arriba */}
      <div className="mx-auto -mt-[2px] h-1 w-16 border-x-2 border-[#7a1414] bg-black/92" />

      <ScrollArea className="medieval-scroll max-h-[calc(100vh-11rem)] px-2 py-2">
        <div className="space-y-1.5">
          {MARKER_GROUPS.map((g) => {
            const gActive = activeGroups[g.key];
            const isOpen = !!expanded[g.key];
            return (
              <div
                key={g.key}
                className="rounded-sm border border-[#3a1414] bg-black/70 shadow-inner"
              >
                <div className="flex items-center gap-1.5 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((p) => ({ ...p, [g.key]: !p[g.key] }))
                    }
                    className="text-[#b81a1a] hover:text-[#e8dfd0]"
                    aria-label={isOpen ? "Colapsar" : "Expandir"}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <Checkbox
                    checked={gActive}
                    onCheckedChange={(v) => onChangeGroup(g.key, v === true)}
                    className="border-[#7a1414] data-[state=checked]:bg-[#b81a1a] data-[state=checked]:text-black"
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-[#7a1414]"
                    style={{ background: g.color }}
                  />
                  <span className="font-serif text-sm font-bold uppercase tracking-wider text-[#e8dfd0]">
                    {g.name}
                  </span>
                </div>
                {isOpen && (
                  <div className="space-y-1 border-t border-[#3a1414] px-2 py-1.5 pl-7">
                    {g.types.map((tp) => {
                      const key = `${g.key}:${tp.key}`;
                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-2 text-xs"
                        >
                          <Checkbox
                            checked={activeTypes[key]}
                            onCheckedChange={(v) =>
                              onChangeType(g.key, tp.key, v === true)
                            }
                            className="border-[#7a1414] data-[state=checked]:bg-[#b81a1a] data-[state=checked]:text-black"
                          />
                          <span>{tp.icon}</span>
                          <span className="text-[#c8bfae]">{tp.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="space-y-1.5 border-t-2 border-[#7a1414] bg-gradient-to-r from-[#2a0a0a] via-black to-[#2a0a0a] p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-2 border-[#7a1414] bg-black font-serif text-xs uppercase tracking-widest text-[#e8dfd0] hover:bg-[#2a0a0a] hover:text-[#fff]"
          onClick={() => setAll(true)}
        >
          Activar todos
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-2 border-[#7a1414] bg-black font-serif text-xs uppercase tracking-widest text-[#e8dfd0] hover:bg-[#2a0a0a] hover:text-[#fff]"
          onClick={() => setAll(false)}
        >
          Desactivar todos
        </Button>
      </div>
    </aside>
  );
}
