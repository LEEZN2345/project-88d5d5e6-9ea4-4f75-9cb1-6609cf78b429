import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ORDERS, EXCHANGE_REASON_LABEL, type ExchangeReason } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { Info, X } from "lucide-react";

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 5;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const ACCEPT_ATTR = ACCEPT_TYPES.join(",");
const ACCEPT_LABEL = "JPG / PNG / WEBP";

export const Route = createFileRoute("/orders/$id/exchange")({
  head: () => ({ meta: [{ title: "申请换货 · 东大门订货通" }] }),
  component: ApplyExchange,
  notFoundComponent: () => (
    <MobileShell>
      <div className="p-8 text-center text-sm">订单不存在</div>
    </MobileShell>
  ),
});

const REASONS: ExchangeReason[] = ["size", "color", "defect", "wrong_item", "other"];

function ApplyExchange() {
  const { id } = Route.useParams();
  const o = ORDERS.find((x) => x.id === id);
  if (!o) throw notFound();
  const navigate = useNavigate();

  const [pick, setPick] = useState(0);
  const [reason, setReason] = useState<ExchangeReason>("size");
  const [toColor, setToColor] = useState("");
  const [toSize, setToSize] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<{ url: string; key: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const item = o.items[pick]!;

  const verifyImage = (url: string) =>
    new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
      img.onerror = () => resolve(false);
      img.src = url;
    });

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast.error(`已达上限：最多上传 ${MAX_PHOTOS} 张照片`);
      return;
    }
    const incoming = Array.from(files);
    if (incoming.length > remaining) {
      toast.warning(`只能再上传 ${remaining} 张，超出部分已忽略`);
    }

    setUploading(true);
    const accepted: { url: string; key: string; name: string }[] = [];
    let skipped = 0;
    const existing = new Set(photos.map((p) => p.key));

    for (const f of incoming.slice(0, remaining)) {
      const name = f.name || "未命名文件";
      if (f.size === 0) {
        toast.error(`${name}：文件为空或读取失败，请重新选择`);
        skipped++;
        continue;
      }
      if (!f.type.startsWith("image/")) {
        toast.error(`${name}：不是图片文件，仅支持 ${ACCEPT_LABEL}`);
        skipped++;
        continue;
      }
      if (!ACCEPT_TYPES.includes(f.type)) {
        toast.error(`${name}：暂不支持 ${f.type || "该"} 格式，请转为 ${ACCEPT_LABEL}`);
        skipped++;
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(
          `${name}：${(f.size / 1024 / 1024).toFixed(1)}MB 超过 ${MAX_SIZE_MB}MB 上限，请压缩后重试`,
        );
        skipped++;
        continue;
      }
      const key = `${f.name}-${f.size}-${f.lastModified}`;
      if (existing.has(key) || accepted.some((a) => a.key === key)) {
        toast.error(`${name}：已选择过相同照片，请勿重复上传`);
        skipped++;
        continue;
      }
      const url = URL.createObjectURL(f);
      const ok = await verifyImage(url);
      if (!ok) {
        URL.revokeObjectURL(url);
        toast.error(`${name}：图片已损坏或无法解析，请重新拍摄`);
        skipped++;
        continue;
      }
      accepted.push({ url, key, name });
    }

    setUploading(false);
    if (accepted.length > 0) {
      setPhotos((ps) => [...ps, ...accepted]);
      toast.success(
        skipped > 0
          ? `已添加 ${accepted.length} 张，${skipped} 张未通过校验`
          : `已添加 ${accepted.length} 张照片`,
      );
    } else if (skipped > 0) {
      toast.error("本次选择的照片均未通过校验，请根据提示重新上传");
    }
  };

  const submit = () => {
    if (!toColor || !toSize) {
      toast.error("请填写希望换的颜色与尺码");
      return;
    }
    if (note.trim().length < 5) {
      toast.error("请填写不良/换货文字描述（至少 5 个字）");
      return;
    }
    if (uploading) {
      toast.error("图片仍在校验中，请稍候再提交");
      return;
    }
    if (photos.length < 1 || photos.length > MAX_PHOTOS) {
      toast.error(`请上传 1-${MAX_PHOTOS} 张实拍照片作为凭证`);
      return;
    }
    toast.success("已提交不良交换申请，客服将在 24 小时内审核");
    navigate({ to: "/exchanges" });
  };

  return (
    <MobileShell>
      <MobileHeader title="申请换货" back />

      <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          平台仅支持<b>换货</b>，不支持退货。审核通过后需将货物寄回平台<b>国内集运仓</b>，由平台转寄韩国档口配货后再重新发出。签收 7 天内可申请。
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-sm font-medium">选择要换货的商品</div>
        <div className="space-y-2">
          {o.items.map((it, i) => (
            <button
              key={i}
              onClick={() => setPick(i)}
              className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left ${
                i === pick ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <img src={it.product.images[0]} alt="" className="h-12 w-12 rounded object-cover" />
              <div className="flex-1 text-xs">
                <div className="line-clamp-1">{it.product.name}</div>
                <div className="text-muted-foreground">
                  {it.color} / {it.size} · ×{it.qty}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-sm font-medium">换货原因</div>
        <div className="flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`rounded-full border px-3 py-1 text-xs ${
                reason === r ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
              }`}
            >
              {EXCHANGE_REASON_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-sm font-medium">希望换成</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">颜色</Label>
            <Input
              value={toColor}
              onChange={(e) => setToColor(e.target.value)}
              placeholder={`如 ${item.color}`}
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs">尺码</Label>
            <Input
              value={toSize}
              onChange={(e) => setToSize(e.target.value)}
              placeholder={`如 ${item.size}`}
              className="mt-1 h-9"
            />
          </div>
        </div>
        <div className="mt-3">
          <Label className="text-xs">
            不良/换货描述 <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请详细描述不良情况或换货原因，例：袖口有明显线头，希望更换同款同色。"
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="mt-3">
          <Label className="text-xs">
            实拍凭证 <span className="text-rose-500">*</span>
            <span className="ml-1 text-[11px] text-muted-foreground">
              （1-{MAX_PHOTOS} 张，{ACCEPT_LABEL}，单张 ≤ {MAX_SIZE_MB}MB）
            </span>
          </Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div
                key={p.key}
                className="relative h-16 w-16 overflow-hidden rounded-md border border-border"
              >
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setPhotos((ps) => {
                      URL.revokeObjectURL(ps[i]!.url);
                      return ps.filter((_, j) => j !== i);
                    })
                  }
                  className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-md bg-black/60 text-white"
                  aria-label="删除"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border text-lg text-muted-foreground hover:border-primary hover:text-primary">
                +
                <span className="text-[10px]">{photos.length}/{MAX_PHOTOS}</span>
                <input
                  type="file"
                  accept={ACCEPT_ATTR}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    onPickFiles(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 mb-6 flex gap-2">
        <Link to="/orders/$id" params={{ id: o.id }} className="flex-1">
          <Button variant="outline" className="w-full">取消</Button>
        </Link>
        <Button className="flex-1" onClick={submit}>提交申请</Button>
      </div>
    </MobileShell>
  );
}