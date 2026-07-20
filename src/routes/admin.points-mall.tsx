import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Flame, Sparkles, Shirt, Gem, Search, Pencil, Power,
  Trash2, ImagePlus, Gift, TrendingUp, Coins, PackageCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/points-mall")({
  head: () => ({ meta: [{ title: "积分商城管理 · 运营后台" }] }),
  component: AdminPointsMall,
});

type Zone = "flash" | "starter" | "basic" | "premium";
type Item = {
  id: string;
  name: string;
  zone: Zone;
  points: number;
  originalPoints?: number;
  stock: number;
  status: "on" | "off";
  source: "滞销库存" | "常规";
  cover?: string;
};

const ZONE_META: Record<Zone, { label: string; range: string; icon: typeof Flame; color: string; ring: string }> = {
  flash:   { label: "限时秒杀",   range: "限时 · 半价", icon: Flame,    color: "bg-orange-500", ring: "ring-orange-200" },
  starter: { label: "上手兑换",   range: "200–500 分",  icon: Sparkles, color: "bg-rose-500",   ring: "ring-rose-200" },
  basic:   { label: "打底衫专区", range: "1000–2000 分", icon: Shirt,   color: "bg-sky-500",    ring: "ring-sky-200" },
  premium: { label: "高价值专区", range: "3000–5000 分", icon: Gem,     color: "bg-violet-500", ring: "ring-violet-200" },
};

const MOCK: Item[] = [
  { id: "P-001", name: "水钻发夹",             zone: "starter", points: 200,  stock: 320, status: "on",  source: "滞销库存", cover: "https://picsum.photos/seed/hair2/240/240" },
  { id: "P-002", name: "白色纯棉T恤",           zone: "basic",   points: 1200, stock: 85,  status: "on",  source: "常规",     cover: "https://picsum.photos/seed/tee3/240/240" },
  { id: "P-003", name: "羊毛开衫",              zone: "premium", points: 4200, stock: 12,  status: "on",  source: "滞销库存", cover: "https://picsum.photos/seed/knit3/240/240" },
  { id: "P-004", name: "碎花连衣裙（限时半价）", zone: "flash",   points: 1800, originalPoints: 3600, stock: 30, status: "on", source: "滞销库存", cover: "https://picsum.photos/seed/dress3/240/240" },
  { id: "P-005", name: "针织围巾",              zone: "starter", points: 500,  stock: 0,   status: "off", source: "常规",     cover: "https://picsum.photos/seed/scarf3/240/240" },
  { id: "P-006", name: "亚麻宽松衬衫",           zone: "basic",   points: 1600, stock: 40,  status: "on",  source: "滞销库存", cover: "https://picsum.photos/seed/shirt3/240/240" },
];

function AdminPointsMall() {
  const [zone, setZone] = useState<Zone | "all">("all");
  const [status, setStatus] = useState<"all" | "on" | "off">("all");
  const [kw, setKw] = useState("");
  const [items, setItems] = useState<Item[]>(MOCK);

  const filtered = useMemo(
    () => items.filter((i) =>
      (zone === "all" || i.zone === zone) &&
      (status === "all" || i.status === status) &&
      (kw.trim() === "" || i.name.includes(kw) || i.id.includes(kw)),
    ),
    [items, zone, status, kw],
  );

  const totalStock = items.reduce((s, i) => s + i.stock, 0);
  const onCount = items.filter((i) => i.status === "on").length;

  const zoneCounts: Record<Zone, number> = {
    flash: 0, starter: 0, basic: 0, premium: 0,
  };
  items.forEach((i) => zoneCounts[i.zone]++);

  const toggleStatus = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: i.status === "on" ? "off" : "on" } : i)));

  return (
    <AdminShell>
      {/* 顶部渐变 Hero */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-rose-400 to-orange-400 p-5 text-white shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs opacity-90">
              <Gift className="h-3.5 w-3.5" /> 积分商城 · 兑换运营
            </div>
            <h1 className="mt-1 text-2xl font-semibold">积分商城管理</h1>
            <p className="mt-1 max-w-xl text-xs opacity-90">
              四大专区兑换商品统一上下架 · 优先消化滞销库存 · 每月邀请榜奖励一键发放。
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="bg-white/15 text-white hover:bg-white/25">
              <Gift className="mr-1 h-4 w-4" /> 发放上月邀请榜奖励
            </Button>
            <AddItemDialog
              onCreate={(item) =>
                setItems((p) => [{ ...item, id: `P-${String(p.length + 1).padStart(3, "0")}` }, ...p])
              }
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <HeroStat icon={PackageCheck} label="在架商品"       value={String(onCount)}     hint={`共 ${items.length} 件`} />
          <HeroStat icon={TrendingUp}   label="总库存"         value={totalStock.toLocaleString()} hint="含滞销回收" />
          <HeroStat icon={Coins}        label="本月兑换单"     value="128"                 hint="较上月 +18%" />
          <HeroStat icon={Sparkles}     label="本月积分消耗"   value="264,500"             hint="≈ ¥26,450 等值" />
        </div>
      </div>

      {/* 专区卡片 */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(Object.keys(ZONE_META) as Zone[]).map((z) => {
          const meta = ZONE_META[z];
          const active = zone === z;
          const Icon = meta.icon;
          return (
            <button
              key={z}
              onClick={() => setZone(active ? "all" : z)}
              className={`group relative rounded-xl border bg-card p-4 text-left transition hover:shadow-md ${
                active ? "border-transparent ring-2 " + meta.ring : "border-border"
              }`}
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-white ${meta.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-sm font-semibold">{meta.label}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{meta.range}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tabular-nums">{zoneCounts[z]}</span>
                <span className="text-[11px] text-muted-foreground">件在售</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 商品管理列表 */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">兑换商品列表</div>
            <Badge variant="outline" className="text-[10px]">{filtered.length} 件</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                placeholder="搜索商品名 / 编号"
                className="h-8 w-56 pl-7 text-xs"
              />
            </div>
            <Select value={zone} onValueChange={(v) => setZone(v as Zone | "all")}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部专区</SelectItem>
                {(Object.keys(ZONE_META) as Zone[]).map((z) => (
                  <SelectItem key={z} value={z}>{ZONE_META[z].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="on">在架</SelectItem>
                <SelectItem value="off">下架</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/20 text-xs text-muted-foreground">
              <tr>
                <Th>编号</Th><Th>商品</Th><Th>专区</Th><Th>所需积分</Th>
                <Th>库存</Th><Th>来源</Th><Th>状态</Th><Th className="text-right">操作</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const meta = ZONE_META[i.zone];
                return (
                  <tr key={i.id} className="border-t border-border hover:bg-muted/20">
                    <Td className="font-mono text-xs text-muted-foreground">{i.id}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <img src={i.cover} alt="" className="h-10 w-10 rounded-md object-cover" />
                        <div>
                          <div className="text-sm font-medium">{i.name}</div>
                          {i.originalPoints && (
                            <div className="text-[10px] text-orange-600">半价活动中</div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-white ${meta.color}`}>
                        <meta.icon className="h-3 w-3" /> {meta.label}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-semibold tabular-nums">{i.points.toLocaleString()}</span>
                      <span className="ml-0.5 text-[10px] text-muted-foreground">分</span>
                      {i.originalPoints && (
                        <div className="text-[10px] text-muted-foreground line-through">
                          原 {i.originalPoints.toLocaleString()}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span className={`tabular-nums ${i.stock === 0 ? "font-semibold text-rose-500" : ""}`}>
                        {i.stock}
                      </span>
                      {i.stock === 0 && <Badge variant="destructive" className="ml-2 text-[10px]">缺货</Badge>}
                      {i.stock > 0 && i.stock < 20 && (
                        <Badge className="ml-2 bg-orange-500 text-[10px] text-white">告急</Badge>
                      )}
                    </Td>
                    <Td>
                      {i.source === "滞销库存" ? (
                        <Badge className="bg-amber-500 text-[10px] text-white">滞销回收</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">常规</Badge>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Switch checked={i.status === "on"} onCheckedChange={() => toggleStatus(i.id)} />
                        <span className="text-[11px] text-muted-foreground">
                          {i.status === "on" ? "在架" : "下架"}
                        </span>
                      </div>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2">
                          <Pencil className="mr-1 h-3.5 w-3.5" />编辑
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-rose-500 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-12 text-center text-xs text-muted-foreground">没有符合条件的兑换商品</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 邀请榜 & 说明 */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card className="p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">每月邀请榜奖励</div>
              <div className="mt-1 text-xs text-muted-foreground">
                每月 1 日 00:00 自动结算上月排名 · 前 10 名额外奖励 · 积分/实物二选一。
              </div>
            </div>
            <Power className="h-8 w-8 text-rose-400 opacity-40" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline">查看本月排行</Button>
            <Button size="sm" variant="outline">奖励规则配置</Button>
            <Button size="sm">发放上月奖励</Button>
          </div>
        </Card>
        <Card className="border-dashed p-4 text-xs text-muted-foreground">
          <div className="mb-1 text-sm font-medium text-foreground">兑换与订单打通</div>
          兑换订单与常规订单共用同一物流通道，用户下单后进入订单模块并标记「积分兑换」，售后走同一售后中心。
        </Card>
      </div>
    </AdminShell>
  );
}

function HeroStat({
  icon: Icon, label, value, hint,
}: { icon: typeof Flame; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[11px] opacity-90">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[10px] opacity-75">{hint}</div>
    </div>
  );
}

function AddItemDialog({ onCreate }: { onCreate: (i: Omit<Item, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [zone, setZone] = useState<Zone>("starter");
  const [source, setSource] = useState<Item["source"]>("滞销库存");
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [stock, setStock] = useState("");
  const [orig, setOrig] = useState("");

  const submit = () => {
    if (!name || !points || !stock) return;
    onCreate({
      name,
      zone,
      points: Number(points),
      originalPoints: orig ? Number(orig) : undefined,
      stock: Number(stock),
      status: "on",
      source,
      cover: `https://picsum.photos/seed/${encodeURIComponent(name)}/240/240`,
    });
    setOpen(false);
    setName(""); setPoints(""); setStock(""); setOrig("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-white text-rose-600 hover:bg-white/90">
          <Plus className="mr-1 h-4 w-4" /> 上架兑换商品
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>上架兑换商品</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label className="text-xs">封面图</Label>
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">商品名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：亚麻宽松衬衫" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">所属专区</Label>
              <Select value={zone} onValueChange={(v) => setZone(v as Zone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ZONE_META) as Zone[]).map((z) => (
                    <SelectItem key={z} value={z}>{ZONE_META[z].label} · {ZONE_META[z].range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">库存来源</Label>
              <Select value={source} onValueChange={(v) => setSource(v as Item["source"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="滞销库存">滞销库存</SelectItem>
                  <SelectItem value="常规">常规采购</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">所需积分</Label>
              <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="1200" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">原始积分（可选）</Label>
              <Input type="number" value={orig} onChange={(e) => setOrig(e.target.value)} placeholder="半价填写" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">库存数量</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="50" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">上架说明（可选）</Label>
            <Textarea rows={2} placeholder="例：邀请榜赠品同款 · 每人限兑 1 件" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submit}>确认上架</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) =>
  <th className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) =>
  <td className={`px-3 py-2 align-middle ${className}`}>{children}</td>;

// removed old Stat component
function _unusedStat() { return null; }

/* legacy placeholder to satisfy prior exports */
function _legacy() {
  return (
    <>
      {/* old content removed after redesign */}
    </>
  );
}

// original component removed below
function _dead() {
  return null;
}

// The following ensures backwards imports do nothing extra.
function _null() { return null; }

// end of file
function _end() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">积分商城管理</h1>
          <p className="text-xs text-muted-foreground">四大专区兑换商品上下架 + 每月邀请榜奖励发放。</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />上架兑换商品</Button>
      </div>
    </div>
  );
}