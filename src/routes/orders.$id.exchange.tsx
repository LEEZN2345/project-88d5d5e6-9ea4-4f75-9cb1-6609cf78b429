import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ORDERS, EXCHANGE_REASON_LABEL, type ExchangeReason } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";

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

  const item = o.items[pick]!;

  const submit = () => {
    if (!toColor || !toSize) {
      toast.error("请填写希望换的颜色与尺码");
      return;
    }
    toast.success("已提交换货申请，客服将在 24 小时内审核");
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
          <Label className="text-xs">补充说明（可选）</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例：M 码偏小，想换 L 码同色"
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="mt-3">
          <Label className="text-xs">上传凭证（建议 1-3 张）</Label>
          <div className="mt-1 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-border text-lg text-muted-foreground"
              >
                +
              </div>
            ))}
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