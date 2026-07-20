import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUCTS, SHOPS, formatKRW } from "@/lib/mock-data";
import { ChevronDown, Download, Save, Scale } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/product-weights")({
  head: () => ({ meta: [{ title: "商品配重表 · 运营后台" }] }),
  component: ProductWeights,
});

const STORAGE_KEY = "platform_product_weight_overrides_v1";

function readOverrides(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function ProductWeights() {
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [keyword, setKeyword] = useState("");
  const [shopId, setShopId] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

  useEffect(() => {
    const o = readOverrides();
    setOverrides(o);
    const d: Record<string, string> = {};
    PRODUCTS.forEach((p) => {
      const w = o[p.id] ?? p.weightGrams;
      d[p.id] = w ? String(w) : "";
    });
    setDrafts(d);
  }, []);

  const persist = (next: Record<string, number>) => {
    setOverrides(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (shopId && p.shopId !== shopId) return false;
      const effective = overrides[p.id] ?? p.weightGrams;
      if (onlyMissing && effective) return false;
      if (!kw) return true;
      return p.internalCode.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw);
    });
  }, [keyword, shopId, onlyMissing, overrides]);

  const missing = useMemo(
    () => PRODUCTS.filter((p) => !(overrides[p.id] ?? p.weightGrams)).length,
    [overrides],
  );

  const saveOne = (id: string) => {
    const raw = drafts[id]?.trim();
    if (!raw) {
      const next = { ...overrides };
      delete next[id];
      persist(next);
      toast.success("已清空该商品重量");
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num <= 0) {
      toast.error("请输入大于 0 的数字（克）");
      return;
    }
    persist({ ...overrides, [id]: Math.round(num) });
    toast.success("已保存");
  };

  const saveAll = () => {
    const next = { ...overrides };
    let updated = 0;
    for (const p of PRODUCTS) {
      const raw = drafts[p.id]?.trim() ?? "";
      if (!raw) continue;
      const num = Number(raw);
      if (!Number.isFinite(num) || num <= 0) continue;
      const rounded = Math.round(num);
      if (next[p.id] !== rounded) {
        next[p.id] = rounded;
        updated++;
      }
    }
    persist(next);
    toast.success(`已批量保存 ${updated} 条`);
  };

  const exportCsv = () => {
    const headers = ["内部款号", "商品名", "档口", "位置", "净重(克)"];
    const rows = PRODUCTS.map((p) => {
      const shop = SHOPS.find((s) => s.id === p.shopId);
      const w = overrides[p.id] ?? p.weightGrams ?? "";
      return [
        p.internalCode,
        p.name,
        shop ? `${shop.name}` : "",
        shop ? `${shop.building} ${shop.floor}-${shop.position}` : "",
        String(w),
      ];
    });
    const csv =
      "\ufeff" +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "商品配重表.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Scale className="h-5 w-5" /> 商品配重表
          </h1>
          <p className="text-xs text-muted-foreground">
            按 SKU 逐条录入商品实测净重（克），用于国际运费自动核算。为空的商品下单时会被拦截。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="mr-1 h-4 w-4" />导出 CSV
          </Button>
          <Button size="sm" onClick={saveAll}>
            <Save className="mr-1 h-4 w-4" />保存全部
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">商品总数</div>
          <div className="mt-1 text-2xl font-semibold">{PRODUCTS.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">已配重</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-600">
            {PRODUCTS.length - missing}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">未配重</div>
          <div className="mt-1 text-2xl font-semibold text-rose-500">{missing}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            placeholder="搜索内部款号 / 商品名"
            className="max-w-xs"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                {shopId ? SHOPS.find((s) => s.id === shopId)?.name ?? "档口" : "所有档口"}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 overflow-auto">
              <DropdownMenuItem onClick={() => setShopId("")}>所有档口</DropdownMenuItem>
              {SHOPS.map((s) => (
                <DropdownMenuItem key={s.id} onClick={() => setShopId(s.id)}>
                  {s.name} · {s.building} {s.floor}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant={onlyMissing ? "default" : "outline"}
            onClick={() => setOnlyMissing((v) => !v)}
          >
            仅看未配重
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">共 {filtered.length} 条</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>图</Th>
                <Th>内部款号</Th>
                <Th>商品名</Th>
                <Th>档口</Th>
                <Th>价格</Th>
                <Th>当前重量(g)</Th>
                <Th>录入 / 修改(g)</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">
                    无匹配商品
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const shop = SHOPS.find((s) => s.id === p.shopId);
                const effective = overrides[p.id] ?? p.weightGrams;
                return (
                  <tr key={p.id} className="border-t border-border">
                    <Td>
                      <img src={p.images[0]} className="h-12 w-12 rounded object-cover" alt="" />
                    </Td>
                    <Td className="font-mono text-xs">
                      <Link
                        to="/admin/products/$id"
                        params={{ id: p.id }}
                        className="hover:underline"
                      >
                        {p.internalCode}
                      </Link>
                    </Td>
                    <Td className="max-w-[220px] truncate">{p.name}</Td>
                    <Td className="text-xs">
                      {shop ? (
                        <>
                          <div>{shop.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {shop.building} {shop.floor}-{shop.position}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="text-xs">{formatKRW(p.priceKRW)}</Td>
                    <Td className="text-xs">
                      {effective ? (
                        <span className="font-mono">{effective}</span>
                      ) : (
                        <Badge variant="outline" className="border-rose-300 text-rose-500">
                          未填
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      <Input
                        type="number"
                        min={0}
                        step={10}
                        placeholder="例如 680"
                        className="h-8 w-28 font-mono"
                        value={drafts[p.id] ?? ""}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [p.id]: e.target.value }))
                        }
                      />
                    </Td>
                    <Td>
                      <Button size="sm" variant="outline" onClick={() => saveOne(p.id)}>
                        保存
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
        <div className="mb-1 font-medium text-foreground">配重说明</div>
        <ul className="space-y-0.5">
          <li>· 单件净重需含吊牌 / 包装，单位为克（g），整数录入。</li>
          <li>· 本页录入的数值会覆盖商品编辑页的默认重量，用于国际运费核算。</li>
          <li>· 未填重量的商品在买手端下单时会被拦截并提示补录。</li>
        </ul>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-3 py-2 text-left font-medium">{children}</th>
);
const Td = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <td className={`px-3 py-2 ${className}`}>{children}</td>;