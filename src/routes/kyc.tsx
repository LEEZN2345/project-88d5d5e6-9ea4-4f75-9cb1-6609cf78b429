import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Upload } from "lucide-react";

export const Route = createFileRoute("/kyc")({
  head: () => ({ meta: [{ title: "实名认证 · 东大门订货通" }] }),
  component: Kyc,
});

function Kyc() {
  return (
    <MobileShell>
      <MobileHeader title="实名认证" back />
      <Card className="mx-4 mt-4 border-amber-300/40 bg-amber-50 p-3 text-xs dark:bg-amber-950/30">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-amber-600" /> 当前状态:未认证
        </div>
        <div className="mt-1 text-muted-foreground">
          因走的是个人代购通道,不占用您的 5 万额度。实名仅用于退款回执核对与发票开具,资料加密存储。
        </div>
      </Card>

      <div className="space-y-3 px-4 pt-4">
        <Field label="真实姓名" placeholder="请输入身份证姓名" />
        <Field label="身份证号" placeholder="18 位身份证号" />
        <Field label="店铺/公司名称(选填)" placeholder="例如 XX 服饰" />

        <div className="text-sm font-medium">身份证照片</div>
        <div className="grid grid-cols-2 gap-3">
          {["人像面", "国徽面"].map((s) => (
            <button
              key={s}
              className="flex aspect-[3/2] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-xs text-muted-foreground"
            >
              <Upload className="mb-1 h-5 w-5" />
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button className="w-full">提交认证</Button>
      </div>
    </MobileShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium">{label}</div>
      <Input placeholder={placeholder} />
    </div>
  );
}