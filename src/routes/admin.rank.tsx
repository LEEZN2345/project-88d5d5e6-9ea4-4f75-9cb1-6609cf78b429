import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SHOPS } from "@/lib/mock-data";
import {
  getRankConfig,
  saveRankConfig,
  resetRankConfig,
  type RankConfig,
  type RankBoard,
} from "@/lib/rank-config";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rank")({
  head: () => ({ meta: [{ title: "榜单与热门档口 · 运营后台" }] }),
  component: AdminRank,
});

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}

function AdminRank() {
  const [cfg, setCfg] = useState<RankConfig | null>(null);
  useEffect(() => setCfg(getRankConfig()), []);

  if (!cfg) return <AdminShell><div className="text-sm text-muted-foreground">加载中…</div></AdminShell>;

  const save = (next: RankConfig) => {
    setCfg(next);
    saveRankConfig(next);
  };
  const patchBoard = (id: string, patch: Partial<RankBoard>) =>
    save({ ...cfg, boards: cfg.boards.map((b) => (b.id === id ? { ...b, ...patch } : b)) });

  const toggleHot = (id: string) =>
    save({
      ...cfg,
      hotShopIds: cfg.hotShopIds.includes(id)
        ? cfg.hotShopIds.filter((x) => x !== id)
        : [...cfg.hotShopIds, id],
    });

  return (
    <AdminShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">榜单与热门档口配置</h1>
          <p className="text-xs text-muted-foreground">
            对应买手端「档口 → 拿货排行榜 / 热门档口」两个分类，保存后立即生效。
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            resetRankConfig();
            setCfg(getRankConfig());
            toast.success("已恢复默认配置");
          }}
        >
          恢复默认
        </Button>
      </div>

      <Tabs defaultValue="rank">
        <TabsList>
          <TabsTrigger value="rank">拿货排行榜</TabsTrigger>
          <TabsTrigger value="hot">热门档口</TabsTrigger>
        </TabsList>

        {/* 排行榜 */}
        <TabsContent value="rank" className="mt-4 space-y-4">
          {cfg.boards.map((board) => (
            <Card key={board.id} className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">榜单：{board.title}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {board.enabled ? "已上架" : "已隐藏"}
                  </span>
                  <Switch
                    checked={board.enabled}
                    onCheckedChange={(v) => patchBoard(board.id, { enabled: v })}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">榜单标题</Label>
                  <Input
                    value={board.title}
                    onChange={(e) => patchBoard(board.id, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">副标题</Label>
                  <Input
                    value={board.subtitle}
                    onChange={(e) => patchBoard(board.id, { subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">角标文案</Label>
                  <Input
                    value={board.badge}
                    onChange={(e) => patchBoard(board.id, { badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 mb-2 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  榜单条目（共 {board.items.length} 个，顺序即名次）
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patchBoard(board.id, {
                      items: [...board.items, { name: "", location: "" }],
                    })
                  }
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  新增档口
                </Button>
              </div>

              <div className="divide-y divide-border rounded-md border border-border">
                {board.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-2">
                    <Badge variant="outline" className="w-9 shrink-0 justify-center tabular-nums">
                      {i + 1}
                    </Badge>
                    <Input
                      className="h-8 flex-1"
                      placeholder="档口名"
                      value={it.name}
                      onChange={(e) =>
                        patchBoard(board.id, {
                          items: board.items.map((x, k) =>
                            k === i ? { ...x, name: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      className="h-8 flex-1"
                      placeholder="位置，如 apM-1F-123"
                      value={it.location}
                      onChange={(e) =>
                        patchBoard(board.id, {
                          items: board.items.map((x, k) =>
                            k === i ? { ...x, location: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => patchBoard(board.id, { items: move(board.items, i, -1) })}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => patchBoard(board.id, { items: move(board.items, i, 1) })}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-rose-500"
                      onClick={() =>
                        patchBoard(board.id, { items: board.items.filter((_, k) => k !== i) })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {board.items.length === 0 && (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    暂无条目
                  </div>
                )}
              </div>
            </Card>
          ))}

          <Card className="p-4">
            <Label className="mb-1 block text-xs text-muted-foreground">榜单底部说明</Label>
            <Input
              value={cfg.hotNote}
              onChange={(e) => save({ ...cfg, hotNote: e.target.value })}
              className="max-w-lg"
            />
          </Card>
        </TabsContent>

        {/* 热门档口 */}
        <TabsContent value="hot" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="mb-3 text-sm font-semibold">
              已选热门档口（{cfg.hotShopIds.length}）· 顺序即买手端展示顺序
            </div>
            <div className="divide-y divide-border rounded-md border border-border">
              {cfg.hotShopIds.map((id, i) => {
                const s = SHOPS.find((x) => x.id === id);
                if (!s) return null;
                return (
                  <div key={id} className="flex items-center gap-3 px-3 py-2">
                    <Badge variant="outline" className="w-9 shrink-0 justify-center tabular-nums">
                      {i + 1}
                    </Badge>
                    <img src={s.cover} alt={s.name} className="h-10 w-16 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.building} · {s.floor} · {s.productCount} 款
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => save({ ...cfg, hotShopIds: move(cfg.hotShopIds, i, -1) })}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => save({ ...cfg, hotShopIds: move(cfg.hotShopIds, i, 1) })}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleHot(id)}>
                      移除
                    </Button>
                  </div>
                );
              })}
              {cfg.hotShopIds.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  尚未选择热门档口
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-sm font-semibold">全部档口 · 勾选加入热门</div>
            <div className="grid gap-2 md:grid-cols-2">
              {SHOPS.map((s) => {
                const on = cfg.hotShopIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                  >
                    <img src={s.cover} alt={s.name} className="h-10 w-16 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.building} · {s.floor}
                      </div>
                    </div>
                    <Switch checked={on} onCheckedChange={() => toggleHot(s.id)} />
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-[11px] text-muted-foreground">
        修改即时保存到本地配置（上线接入云端后改为写库）。
      </div>
    </AdminShell>
  );
}
