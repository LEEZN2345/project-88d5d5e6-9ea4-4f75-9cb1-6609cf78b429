import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "设置 · 东大门订货通" }] }),
  component: Settings,
});

function Settings() {
  return (
    <MobileShell>
      <MobileHeader title="设置" back />

      <div className="px-4 pt-4 text-xs text-muted-foreground">通知</div>
      <Card className="mx-4 mt-2 divide-y divide-border">
        <Row label="订单状态推送" rightSwitch defaultChecked />
        <Row label="物流节点推送" rightSwitch defaultChecked />
        <Row label="新款上新提醒" rightSwitch />
        <Row label="促销活动短信" rightSwitch />
      </Card>

      <div className="px-4 pt-4 text-xs text-muted-foreground">账户</div>
      <Card className="mx-4 mt-2 divide-y divide-border">
        <Row label="修改手机号" right="138****6621" link />
        <Row label="修改登录密码" link />
        <Row label="退款收款账号" right="支付宝 138****6621" link />
      </Card>

      <div className="px-4 pt-4 text-xs text-muted-foreground">通用</div>
      <Card className="mx-4 mt-2 divide-y divide-border">
        <Row label="语言" right="简体中文" link />
        <Row label="清除缓存" right="12.4 MB" link />
        <Row label="关于我们" right="v1.0.0 (M1)" link />
        <Row label="服务协议 / 隐私政策" link />
      </Card>

      <div className="px-4 pb-10 pt-6">
        <Button variant="outline" className="w-full text-rose-500" asChild>
          <Link to="/auth">
            <LogOut className="mr-1 h-4 w-4" />
            退出登录
          </Link>
        </Button>
      </div>
    </MobileShell>
  );
}

function Row({
  label,
  right,
  rightSwitch,
  defaultChecked,
  link,
}: {
  label: string;
  right?: string;
  rightSwitch?: boolean;
  defaultChecked?: boolean;
  link?: boolean;
}) {
  return (
    <div className="flex items-center px-4 py-3 text-sm">
      <span className="flex-1">{label}</span>
      {right && <span className="text-xs text-muted-foreground">{right}</span>}
      {rightSwitch && <Switch defaultChecked={defaultChecked} />}
      {link && <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />}
    </div>
  );
}