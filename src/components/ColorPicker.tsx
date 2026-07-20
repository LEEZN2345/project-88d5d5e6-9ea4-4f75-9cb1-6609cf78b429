import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COLOR_PRESETS, searchColors } from "@/lib/color-config";
import { X, Search } from "lucide-react";

interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  placeholder?: string;
  quickPickCount?: number;
}

const QUICK_PICK_ZH = [
  "黑色",
  "白色",
  "灰色",
  "米色",
  "蓝色",
  "藏蓝色",
  "粉红",
  "红色",
  "绿色",
  "卡其色",
  "棕色",
  "紫色",
  "黄色",
  "橙色",
  "牛仔深蓝色",
  "杏色",
];

export function ColorPicker({
  colors,
  onChange,
  placeholder = "搜索颜色（中文/韩文）",
  quickPickCount = 18,
}: ColorPickerProps) {
  const [query, setQuery] = useState("");

  const addColor = (value: string) => {
    const v = value.trim();
    if (!v || colors.includes(v)) return;
    onChange([...colors, v]);
    setQuery("");
  };

  const removeColor = (value: string) => {
    onChange(colors.filter((c) => c !== value));
  };

  const matches = useMemo(() => searchColors(query), [query]);

  const quickPicks = useMemo(
    () => COLOR_PRESETS.filter((c) => QUICK_PICK_ZH.includes(c.zh)).slice(0, quickPickCount),
    [quickPickCount],
  );

  const showDropdown = query.trim().length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {colors.map((c) => (
          <Badge key={c} variant="outline" className="gap-1 pr-1">
            {c}
            <button
              type="button"
              onClick={() => removeColor(c)}
              className="rounded p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <div className="flex gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (matches.length === 1) {
                    addColor(matches[0].zh);
                  } else if (query.trim() && !colors.includes(query.trim())) {
                    addColor(query.trim());
                  }
                }
              }}
              placeholder={placeholder}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (matches.length === 1) {
                addColor(matches[0].zh);
              } else if (query.trim()) {
                addColor(query.trim());
              }
            }}
            className="h-8 px-2 text-xs"
          >
            添加
          </Button>
        </div>

        {showDropdown && (
          <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md">
            {matches.length === 0 ? (
              <div className="px-2 py-2 text-xs text-muted-foreground">
                无匹配预设，按「添加」将 "{query.trim()}" 作为自定义颜色
              </div>
            ) : (
              matches.map((c) => (
                <button
                  key={c.ko}
                  type="button"
                  onClick={() => addColor(c.zh)}
                  className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                >
                  <span className="font-medium">{c.zh}</span>
                  <span className="ml-2 text-muted-foreground">{c.ko}</span>
                  {c.aliases && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      {c.aliases.join(" / ")}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-muted-foreground">常用颜色</div>
        <div className="flex flex-wrap gap-1">
          {quickPicks.map((c) => {
            const selected = colors.includes(c.zh);
            return (
              <button
                key={c.ko}
                type="button"
                onClick={() => (selected ? removeColor(c.zh) : addColor(c.zh))}
                className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {c.zh}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        可直接搜索中文或韩文颜色名，回车添加；未命中预设时允许自定义。
      </p>
    </div>
  );
}
