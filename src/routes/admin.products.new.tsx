import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ColorPicker } from "@/components/ColorPicker";
import { SHOPS } from "@/lib/mock-data";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({ meta: [{ title: "新增商品 · 运营后台" }] }),
  component: NewProduct,
});

const ORIGIN_OPTIONS = ["韩国", "中国", "其他"] as const;

function NewProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [shopId, setShopId] = useState<string>("");
  const [shopNameInput, setShopNameInput] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [origin, setOrigin] = useState<(typeof ORIGIN_OPTIONS)[number]>("韩国");
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [composition, setComposition] = useState("以实物为准");
  const [purchaseCondition, setPurchaseCondition] = useState<"single" | "moq2">("single");
  const [weight, setWeight] = useState<string>("");

  const selectedShop = useMemo(() => SHOPS.find((s) => s.id === shopId), [shopId]);

  const onSelectShop = (id: string) => {
    setShopId(id);
    const s = SHOPS.find((x) => x.id === id);
    if (s) {
      setShopNameInput(`${s.name} / ${s.nameKo}`);
      setShopLocation(`${s.building} ${s.floor}-${s.position}`);
    }
  };

  const handleFilePick = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 9 - images.length);
    Promise.all(
      arr.map(
        (f) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(f);
          }),
      ),
    ).then((urls) => setImages((prev) => [...prev, ...urls].slice(0, 9)));
  };

  const addSize = () => {
    const v = newSize.trim();
    if (!v || sizes.includes(v)) return;
    setSizes((p) => [...p, v]);
    setNewSize("");
  };

  const submit = () => {
    if (images.length === 0) return toast.error("请至少上传 1 张商品图片");
    if (!shopNameInput.trim()) return toast.error("请填写档口名字");
    if (!shopLocation.trim()) return toast.error("请填写档口位置");
    if (!name.trim()) return toast.error("请填写商品名");
    if (!price || Number(price) <= 0) return toast.error("请填写批发价格");
    if (colors.length === 0) return toast.error("请至少添加一个颜色");
    if (sizes.length === 0) return toast.error("请至少添加一个尺码");
    if (!weight || Number(weight) <= 0) return toast.error("请填写预估重量（克）");
    toast.success(`商品「${name}」已创建，等待上架审核`);
    navigate({ to: "/admin/products" });
  };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回商品列表
        </Link>
        <Button size="sm" onClick={submit}><Save className="mr-1 h-4 w-4" />保存商品</Button>
      </div>

      <h1 className="mb-4 text-xl font-semibold">新增商品</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-3 p-4">
            <Label className="text-xs">1. 商品图片 <span className="text-rose-500">*</span></Label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((src, i) => (
                <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded border border-border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <Badge className="absolute left-1 top-1 bg-primary text-[10px]">主图</Badge>
                  )}
                </div>
              ))}
              {images.length < 9 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded border border-dashed border-border text-xs text-muted-foreground hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />上传图片
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFilePick(e.target.files)}
            />
            <p className="text-[11px] text-muted-foreground">最多 9 张，第 1 张作为主图，系统自动加水印。</p>
          </Card>

          <Card className="grid gap-3 p-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-xs">选择已有档口（可选，用于自动带出档口位置）</Label>
              <Select value={shopId} onValueChange={onSelectShop}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="搜索并选择档口" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {SHOPS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} / {s.nameKo} · {s.building} {s.floor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">2. 档口名字 <span className="text-rose-500">*</span></Label>
              <Input value={shopNameInput} onChange={(e) => setShopNameInput(e.target.value)} placeholder="例如 MILK / 밀크" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">3. 档口位置 <span className="text-rose-500">*</span></Label>
              <Input value={shopLocation} onChange={(e) => setShopLocation(e.target.value)} placeholder="例如 Migliore 2F-A41" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">4. 商品名 <span className="text-rose-500">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="羊毛混纺翻领长大衣" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">5. 商店 ID</Label>
              <Input
                value={selectedShop?.id ?? ""}
                readOnly
                placeholder="系统自动分配 / 选择档口后带出"
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">6. 批发价格（KRW） <span className="text-rose-500">*</span></Label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="168000" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">8. 预估重量（克） <span className="text-rose-500">*</span></Label>
              <Input type="number" min={0} step={10} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="例如 680（用于国际运费）" className="mt-1" />
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <div className="text-sm font-semibold">7. 详情信息</div>

            <div>
              <Label className="text-xs">7.1 制造国</Label>
              <RadioGroup
                value={origin}
                onValueChange={(v) => setOrigin(v as (typeof ORIGIN_OPTIONS)[number])}
                className="mt-2 flex gap-4"
              >
                {ORIGIN_OPTIONS.map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={o} /> {o}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-xs">7.2 颜色 <span className="text-rose-500">*</span></Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {colors.map((c) => (
                  <Badge key={c} variant="outline" className="gap-1">
                    {c}
                    <button onClick={() => setColors((p) => p.filter((x) => x !== c))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
                  placeholder="输入颜色后回车，如 奶白"
                  className="h-8 text-xs"
                />
                <Button size="sm" variant="outline" onClick={addColor}>添加</Button>
              </div>
            </div>

            <div>
              <Label className="text-xs">7.3 尺码 <span className="text-rose-500">*</span></Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {sizes.map((s) => (
                  <Badge key={s} variant="outline" className="gap-1">
                    {s}
                    <button onClick={() => setSizes((p) => p.filter((x) => x !== s))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
                  placeholder="如 FREE / S / M / L"
                  className="h-8 w-40 text-xs"
                />
                <Button size="sm" variant="outline" onClick={addSize}>添加</Button>
                {["FREE", "S", "M", "L", "XL"].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => { if (!sizes.includes(s)) setSizes((p) => [...p, s]); }}
                  >+ {s}</Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">7.4 成分</Label>
              <Textarea
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                rows={2}
                className="mt-1"
                placeholder="以实物为准 / 聚酯纤维 65% 人造纤维 30% 氨纶 5%"
              />
            </div>

            <div>
              <Label className="text-xs">7.5 购买条件</Label>
              <RadioGroup
                value={purchaseCondition}
                onValueChange={(v) => setPurchaseCondition(v as "single" | "moq2")}
                className="mt-2 flex flex-col gap-2"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="single" /> 支持单件购买
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="moq2" /> 同款 2 件起
                </label>
              </RadioGroup>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 text-xs">
            <div className="mb-2 text-sm font-semibold">提交前检查</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>· 图片：{images.length} / 9</li>
              <li>· 档口：{shopNameInput || <span className="text-rose-500">未填</span>}</li>
              <li>· 位置：{shopLocation || <span className="text-rose-500">未填</span>}</li>
              <li>· 商品名：{name || <span className="text-rose-500">未填</span>}</li>
              <li>· 批发价：{price ? `₩${Number(price).toLocaleString()}` : <span className="text-rose-500">未填</span>}</li>
              <li>· 制造国：{origin}</li>
              <li>· 颜色：{colors.length} 项</li>
              <li>· 尺码：{sizes.length} 项</li>
              <li>· 购买条件：{purchaseCondition === "single" ? "支持单件购买" : "同款 2 件起"}</li>
              <li>· 重量：{weight ? `${weight} g` : <span className="text-rose-500">未填</span>}</li>
            </ul>
          </Card>
          <Card className="p-4 text-[11px] text-muted-foreground">
            <div className="mb-1 text-sm font-semibold text-foreground">规则说明</div>
            <div>· 图片上传后统一走 CDN 并加水印，原图仅运营可下载。</div>
            <div>· 内部款号（DD-YYYY-XXXX）由系统自动生成。</div>
            <div>· 未填重量的商品无法自动核算国际运费，将被下单流程拦截。</div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
