import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";
import { MALLS } from "@/lib/buildings";
import { cn } from "@/lib/utils";

export type BuildingSelection = { city: string; building: string; floor: string };

type Props = {
  trigger: React.ReactNode;
  value: BuildingSelection[];
  onChange: (next: BuildingSelection[]) => void;
};

export function BuildingFilterSheet({ trigger, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState<string>(MALLS[0].city);
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  const [alpha, setAlpha] = useState(false);
  const [draft, setDraft] = useState<BuildingSelection[]>(value);

  const mall = MALLS.find((m) => m.city === city)!;
  const buildings = useMemo(() => {
    const list = [...mall.buildings];
    if (alpha) list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [mall, alpha]);

  const toggleFloor = (building: string, floor: string) => {
    const key = (s: BuildingSelection) => s.city === city && s.building === building && s.floor === floor;
    const exists = draft.some(key);
    if (floor === "全部") {
      // remove all floors for this building, then add 全部
      const filtered = draft.filter((s) => !(s.city === city && s.building === building));
      if (exists) setDraft(filtered);
      else setDraft([...filtered, { city, building, floor: "全部" }]);
      return;
    }
    // if 全部 selected, remove it first
    const cleaned = draft.filter((s) => !(s.city === city && s.building === building && s.floor === "全部"));
    setDraft(exists ? cleaned.filter((s) => !key(s)) : [...cleaned, { city, building, floor }]);
  };

  const buildingHasSelection = (b: string) => draft.some((s) => s.city === city && s.building === b);

  const remove = (sel: BuildingSelection) => {
    setDraft(draft.filter((s) => !(s.city === sel.city && s.building === sel.building && s.floor === sel.floor)));
  };

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  const reset = () => {
    setDraft([]);
    setActiveBuilding(null);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(value); }}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="flex h-[88vh] flex-col gap-0 rounded-t-2xl p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-left text-base">按商场搜索档口</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-between px-4 pt-4">
          <div className="text-base font-semibold">商场</div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            字母顺序
            <Switch checked={alpha} onCheckedChange={setAlpha} />
          </label>
        </div>

        <div className="mt-2 flex gap-6 border-b border-border px-4">
          {MALLS.map((m) => (
            <button
              key={m.city}
              onClick={() => { setCity(m.city); setActiveBuilding(null); }}
              className={cn(
                "relative pb-2 text-sm",
                city === m.city ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {m.city}
              {city === m.city && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <ul className="space-y-1">
            {buildings.map((b) => {
              const isActive = activeBuilding === b.name;
              const highlighted = isActive || buildingHasSelection(b.name);
              return (
                <li key={b.name}>
                  <button
                    onClick={() => {
                      if (b.floors.length === 0) {
                        toggleFloor(b.name, "全部");
                      } else {
                        setActiveBuilding(isActive ? null : b.name);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 py-2 text-left text-[15px]",
                      highlighted ? "font-semibold text-primary" : "text-foreground"
                    )}
                  >
                    {b.name}
                    {buildingHasSelection(b.name) && (
                      <X
                        className="h-4 w-4 rounded-full bg-muted p-0.5 text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraft(draft.filter((s) => !(s.city === city && s.building === b.name)));
                        }}
                      />
                    )}
                  </button>
                  {isActive && b.floors.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-2">
                      {["全部", ...b.floors].map((f) => {
                        const selected =
                          f === "全部"
                            ? draft.some((s) => s.city === city && s.building === b.name && s.floor === "全部")
                            : draft.some((s) => s.city === city && s.building === b.name && s.floor === f);
                        return (
                          <button
                            key={f}
                            onClick={() => toggleFloor(b.name, f)}
                            className={cn(
                              "rounded-full border px-4 py-1.5 text-sm",
                              selected
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground"
                            )}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {draft.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border bg-muted/30 px-4 py-2">
            {draft.map((s) => (
              <span key={`${s.city}-${s.building}-${s.floor}`} className="flex items-center gap-1 text-sm">
                {s.building}
                {s.floor !== "全部" && <span className="text-muted-foreground">/{s.floor}</span>}
                <button onClick={() => remove(s)}>
                  <X className="h-4 w-4 rounded-full bg-muted-foreground/30 p-0.5 text-background" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <Button variant="ghost" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            初始化
          </Button>
          <Button onClick={apply} className="flex-1 bg-primary text-primary-foreground">
            适用
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}