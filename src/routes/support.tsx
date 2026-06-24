import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "联系客服 · 东大门订货通" }] }),
  component: Support,
});

const FAQ = [
  { q: "汇率什么时候锁定?", a: "平台在韩国档口完成代付时锁定,买手端同时显示韩币小票。" },
  { q: "为什么我换了一个收款码?", a: "为了合规与稳定性,平台按账户日额度自动切换。所有账户均为公司员工实名个人账户。" },
  { q: "退款多久到账?", a: "客服提单 → 财务复核两级审核,工作日 24 小时内打款,微信/支付宝原路退回。" },
  { q: "物流多久能到?", a: "档口出货 → 韩国仓集货 1-2 天 → 跨境 3-5 天 → 国内派送 1-3 天。" },
  { q: "可以开发票吗?", a: "B 端企业会员可申请增值服务费部分的服务费发票,具体请联系客服。" },
];

function Support() {
  return (
    <MobileShell>
      <MobileHeader title="联系客服" back />
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        {[
          { icon: MessageCircle, label: "微信客服", sub: "9:00-22:00" },
          { icon: Phone, label: "电话热线", sub: "400-888-1234" },
          { icon: Mail, label: "邮件留言", sub: "随时" },
        ].map((c) => (
          <Card key={c.label} className="flex flex-col items-center gap-1 py-4 text-center">
            <c.icon className="h-5 w-5 text-primary" />
            <div className="text-xs font-medium">{c.label}</div>
            <div className="text-[10px] text-muted-foreground">{c.sub}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 px-4 text-sm font-medium">常见问题</div>
      <div className="mt-2 space-y-2 px-4 pb-24">
        {FAQ.map((f) => (
          <Card key={f.q} className="p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{f.q}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{f.a}</div>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button className="w-full">
          <MessageCircle className="mr-1 h-4 w-4" />
          一键加微信客服
        </Button>
      </div>
    </MobileShell>
  );
}