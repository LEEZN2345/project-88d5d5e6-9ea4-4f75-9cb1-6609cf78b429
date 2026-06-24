import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "登录 · 东大门订货通" }] }),
  component: Auth,
});

function Auth() {
  return (
    <MobileShell>
      <div className="flex flex-col items-center pt-12">
        <div className="text-2xl font-bold">东大门订货通</div>
        <div className="mt-1 text-xs text-muted-foreground">为东大门买手与 B 端客户而生</div>
      </div>
      <div className="mt-10 space-y-3 px-6">
        <Input placeholder="手机号" />
        <Input placeholder="验证码 / 密码" type="password" />
        <Button className="w-full">登录 / 注册</Button>
        <div className="text-center text-[11px] text-muted-foreground">
          登录即代表同意 <Link to="/">服务协议</Link> 与隐私政策
        </div>
      </div>
    </MobileShell>
  );
}