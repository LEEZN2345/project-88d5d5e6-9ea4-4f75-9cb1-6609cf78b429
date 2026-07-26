import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { SHOPS, PRODUCTS } from "@/lib/mock-data";
import type { Shop } from "@/lib/mock-data";
import { CPW_AS_SHOPS, CPW_SECTION_LABEL } from "@/lib/cpw-as-shops";
import { APM_AS_SHOPS } from "@/lib/apm-as-shops";
import { APM_PLACE_AS_SHOPS } from "@/lib/apm-place-shops";
import { NUZZON_AS_SHOPS } from "@/lib/nuzzon-shops";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, ImagePlus, Download, Store, MapPin, Pencil, Trash2, X } from "lucide-react";
import { MALLS } from "@/lib/buildings";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/shops")({
  head: () => ({ meta: [{ title: "档口 / 商圈管理 · 运营后台" }] }),
  validateSearch: z.object({ tab: z.enum(["shops", "buildings"]).optional() }),
  component: AdminShops,
});

function AdminShops() {
  const { tab = "shops" } = Route.useSearch();
  const navigate = useNavigate();
  const setTab = (t: "shops" | "buildings") =>
    navigate({ to: "/admin/shops", search: { tab: t } });

  // 合并演示档口 + 从视频抓取的清平和档口
  const allShops = useMemo(
    () => [...SHOPS, ...CPW_AS_SHOPS, ...APM_AS_SHOPS, ...APM_PLACE_AS_SHOPS, ...NUZZON_AS_SHOPS],
    []
  );

  const downloadTemplate = () => {
    const headers = ["档口名称(英文)", "档口名称(韩文)", "楼宇", "层数", "档口位置", "档口背景图URL", "起订件数", "标签(多个用/分隔)"];
    const sample = ["MILK", "밀크", "Migliore", "2F", "A41", "https://.../cover.jpg", "2", "女装/上新快"];
    const csv = "\ufeff" + [headers, sample].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "档口导入模板.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">档口 / 商圈管理</h1>
          <p className="text-xs text-muted-foreground">统一维护商圈楼栋与档口资料。档口在楼栋下挂载，商品在「商品管理」中录入。</p>
        </div>
        {tab === "shops" ? (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadTemplate}><Download className="mr-1 h-4 w-4" />下载导入模板</Button>
          <Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />批量 Excel</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />新增档口</Button>
        </div>
        ) : (
        <Button size="sm" onClick={() => toast.info("新增楼栋弹窗")}><Plus className="mr-1 h-4 w-4" />新增楼栋</Button>
        )}
      </div>

      <div className="mb-4 inline-flex rounded-md border border-border bg-background p-1 text-sm">
        {[
          { k: "shops", label: `档口列表 (${allShops.length})` },
          { k: "buildings", label: `商圈 / 楼栋 (${MALLS.reduce((n, m) => n + m.buildings.length, 0)})` },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as "shops" | "buildings")}
            className={`rounded px-3 py-1 text-xs ${tab === t.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "buildings" ? (
        <BuildingsTab allShops={allShops} />
      ) : (
        <ShopsTab downloadTemplate={downloadTemplate} allShops={allShops} />
      )}
    </AdminShell>
  );
}

function ShopsTab({ downloadTemplate: _dl, allShops }: { downloadTemplate: () => void; allShops: Shop[] }) {
  const [kw, setKw] = useState("");
  const [building, setBuilding] = useState<string>("all");
  const buildings = useMemo(() => Array.from(new Set(allShops.map((s) => s.building))), [allShops]);
  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase();
    return allShops.filter((s) => {
      if (building !== "all" && s.building !== building) return false;
      if (!k) return true;
      return (
        s.name.toLowerCase().includes(k) ||
        s.nameKo.toLowerCase().includes(k) ||
        s.position.toLowerCase().includes(k)
      );
    });
  }, [allShops, kw, building]);

  return (
    <>
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">合作档口</div>
          <div className="mt-1 text-2xl font-semibold">{allShops.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">覆盖楼宇</div>
          <div className="mt-1 text-2xl font-semibold">{new Set(allShops.map((s) => s.building)).size}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">支持单件</div>
          <div className="mt-1 text-2xl font-semibold">{allShops.filter((s) => s.minOrderQty === 1).length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">在售商品数</div>
          <div className="mt-1 text-2xl font-semibold">{PRODUCTS.length}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            placeholder="搜索档口名(中/韩/英)、铺位号"
            className="max-w-xs"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
          />
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="h-9 rounded border border-border bg-background px-2 text-xs"
          >
            <option value="all">所有楼宇</option>
            {buildings.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <div className="ml-auto text-xs text-muted-foreground">
            共 {filtered.length} 条
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>背景图</Th><Th>档口名称</Th><Th>楼宇</Th><Th>层数</Th><Th>档口位置</Th><Th>起订</Th><Th>标签</Th><Th>商品数</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const count = PRODUCTS.filter((p) => p.shopId === s.id).length;
                return (
                  <tr key={s.id} className="border-t border-border">
                    <Td><img src={s.cover} className="h-12 w-16 rounded object-cover" alt="" /></Td>
                    <Td>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">{s.nameKo}</div>
                    </Td>
                    <Td className="text-xs">{s.building}</Td>
                    <Td className="text-xs">
                      {CPW_SECTION_LABEL[s.floor] ?? s.floor}
                    </Td>
                    <Td className="text-xs font-mono">{s.position}</Td>
                    <Td>
                      {s.minOrderQty === 1
                        ? <Badge variant="outline">单件</Badge>
                        : <Badge className="bg-amber-500 text-white">2件起</Badge>}
                    </Td>
                    <Td className="text-xs text-muted-foreground">{s.tags.join(" / ")}</Td>
                    <Td className="text-xs">{count}</Td>
                    <Td>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/admin/shops/$id" params={{ id: s.id }}>编辑</Link>
                      </Button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
          <ImagePlus className="h-4 w-4" /> 档口导入模板字段
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="bg-muted/40 text-[11px] text-muted-foreground">
              <tr><Th>字段</Th><Th>说明</Th><Th>示例</Th></tr>
            </thead>
            <tbody className="text-foreground">
              {[
                ["档口名称(英文)", "英文名，用于展示与匹配", "MILK"],
                ["档口名称(韩文)", "韩文名，展示用", "밀크"],
                ["楼宇", "所在楼宇 / 商场", "Migliore"],
                ["层数", "楼层，例如 B1 / 2F", "2F"],
                ["档口位置", "铺位号", "A41"],
                ["档口背景图URL", "档口封面图，1 张", "https://.../cover.jpg"],
                ["起订件数", "1=支持单件 / 2=同款 2 件起", "2"],
                ["标签", "多个用 / 分隔", "女装/上新快"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-border">
                  <Td className="font-medium">{row[0]}</Td>
                  <Td>{row[1]}</Td>
                  <Td className="font-mono text-[11px] text-muted-foreground">{row[2]}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-1"><Store className="h-3.5 w-3.5" />楼宇 + 层数 + 档口位置 组合唯一，用于商品导入时匹配档口。</div>
      </Card>
    </>
  );
}

function BuildingsTab({ allShops }: { allShops: Shop[] }) {
  const shopCount = (b: string) => allShops.filter((s) => s.building === b).length;
  const [editing, setEditing] = useState<{ city: string; name: string; floors: string[] } | null>(null);
  return (
    <div className="space-y-4">
      {MALLS.map((m) => (
        <Card key={m.city} className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">{m.city}</h2>
            <Badge variant="outline">{m.buildings.length} 栋</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr><Th>楼栋</Th><Th>楼层</Th><Th>关联档口数</Th><Th>操作</Th></tr>
              </thead>
              <tbody>
                {m.buildings.map((b) => (
                  <tr key={b.name} className="border-t border-border">
                    <Td className="font-medium">{b.name}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {b.floors.map((f) => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
                      </div>
                    </Td>
                    <Td>{shopCount(b.name)}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => setEditing({ city: m.city, name: b.name, floors: b.floors })}>编辑楼层</Button>
                        <Button size="sm" variant="ghost">停用</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {editing && <FloorEditor building={editing} allShops={allShops} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FloorEditor({ building, allShops }: { building: { city: string; name: string; floors: string[] }; allShops: Shop[] }) {
  const [floors, setFloors] = useState<string[]>(building.floors);
  const [newFloor, setNewFloor] = useState("");
  const [activeFloor, setActiveFloor] = useState<string>(building.floors[0] ?? "");

  // 档口按 building+floor 分组（mock：以内存 SHOPS 为基础，本地增删）
  const [localShops, setLocalShops] = useState<Shop[]>(() => allShops.filter((s) => s.building === building.name));
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<Shop>>({ minOrderQty: 1 });

  const shopsOnFloor = useMemo(
    () => localShops.filter((s) => s.floor === activeFloor),
    [localShops, activeFloor]
  );

  const addFloor = () => {
    const v = newFloor.trim().toUpperCase();
    if (!v) return;
    if (floors.includes(v)) { toast.error("楼层已存在"); return; }
    setFloors([...floors, v]);
    setNewFloor("");
    toast.success(`已添加楼层 ${v}`);
  };
  const removeFloor = (f: string) => {
    if (localShops.some((s) => s.floor === f)) { toast.error("该楼层下仍有档口，无法删除"); return; }
    setFloors(floors.filter((x) => x !== f));
    if (activeFloor === f) setActiveFloor(floors.filter((x) => x !== f)[0] ?? "");
  };

  const addShop = () => {
    if (!draft.name || !draft.position) { toast.error("请填写档口名称与铺位号"); return; }
    const s: Shop = {
      id: `local-${Date.now()}`,
      name: draft.name!,
      nameKo: draft.nameKo ?? "",
      building: building.name,
      floor: activeFloor,
      position: draft.position!,
      tags: (draft.tags as string[] | undefined) ?? [],
      minOrderQty: (draft.minOrderQty as 1 | 2) ?? 1,
      cover: draft.cover ?? "",
      productCount: 0,
    };
    setLocalShops([s, ...localShops]);
    setDraft({ minOrderQty: 1 });
    setShowAdd(false);
    toast.success("已新增档口（本地演示）");
  };

  return (
    <div>
      <SheetHeader>
        <SheetTitle>{building.city} · {building.name}</SheetTitle>
        <SheetDescription>管理楼层与该楼层下的档口。演示环境改动不落库。</SheetDescription>
      </SheetHeader>

      <div className="mt-5">
        <div className="mb-2 text-xs font-medium text-muted-foreground">楼层</div>
        <div className="flex flex-wrap gap-2">
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`group inline-flex items-center gap-1 rounded border px-2 py-1 text-xs ${activeFloor === f ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"}`}
            >
              {CPW_SECTION_LABEL[f] ?? f}
              <X
                className="h-3 w-3 opacity-0 hover:text-destructive group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); removeFloor(f); }}
              />
            </button>
          ))}
          <div className="flex items-center gap-1">
            <Input
              value={newFloor}
              onChange={(e) => setNewFloor(e.target.value)}
              placeholder="新楼层 如 6F"
              className="h-7 w-28 text-xs"
            />
            <Button size="sm" variant="outline" onClick={addFloor}><Plus className="h-3 w-3" /></Button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded border border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
          <div className="text-sm font-medium">{activeFloor || "—"} 楼层档口 ({shopsOnFloor.length})</div>
          <Button size="sm" onClick={() => setShowAdd((v) => !v)} disabled={!activeFloor}>
            <Plus className="mr-1 h-3 w-3" />新增档口
          </Button>
        </div>
        {showAdd && (
          <div className="grid grid-cols-2 gap-2 border-b border-border bg-background p-3">
            <Input placeholder="档口名称(英文)" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Input placeholder="档口名称(韩文)" value={draft.nameKo ?? ""} onChange={(e) => setDraft({ ...draft, nameKo: e.target.value })} />
            <Input placeholder="铺位号 如 A41" value={draft.position ?? ""} onChange={(e) => setDraft({ ...draft, position: e.target.value })} />
            <select
              className="rounded border border-border bg-background px-2 text-sm"
              value={draft.minOrderQty ?? 1}
              onChange={(e) => setDraft({ ...draft, minOrderQty: Number(e.target.value) as 1 | 2 })}
            >
              <option value={1}>支持单件</option>
              <option value={2}>2 件起批</option>
            </select>
            <Input className="col-span-2" placeholder="标签 用 / 分隔 如 女装/上新快" onChange={(e) => setDraft({ ...draft, tags: e.target.value.split("/").map((x) => x.trim()).filter(Boolean) })} />
            <div className="col-span-2 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setDraft({ minOrderQty: 1 }); }}>取消</Button>
              <Button size="sm" onClick={addShop}>保存</Button>
            </div>
          </div>
        )}
        <div className="divide-y divide-border">
          {shopsOnFloor.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">该楼层暂无档口</div>
          )}
          {shopsOnFloor.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-3 py-2">
              {s.cover ? <img src={s.cover} className="h-10 w-14 rounded object-cover" alt="" /> : <div className="h-10 w-14 rounded bg-muted" />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.name} <span className="text-[11px] text-muted-foreground">{s.nameKo}</span></div>
                <div className="text-[11px] text-muted-foreground">铺位 {s.position} · {s.minOrderQty === 1 ? "单件" : "2 件起"} · {s.tags.join("/")}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.info(`编辑档口 ${s.name}`)}><Pencil className="h-3 w-3" /></Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setLocalShops(localShops.filter((x) => x.id !== s.id)); toast.success("已移除"); }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => toast.info("已取消（演示未落库）")}>取消</Button>
        <Button onClick={() => toast.success("已保存楼层配置（演示未落库）")}>保存</Button>
      </div>
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;