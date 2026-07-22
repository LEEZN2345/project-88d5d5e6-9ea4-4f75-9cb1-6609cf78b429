import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "登录 / 注册 · 东大门订货通" },
      { name: "description", content: "手机号一键注册，注册后即可选择会员身份并解锁全场包邮 / 返佣提现等权益。" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [cd, setCd] = useState(0);

  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    setSent(true);
    setCd(60);
    toast.success("验证码已发送（演示环境请输入 1234）");
    const t = setInterval(() => {
      setCd((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const submit = () => {
    if (!/^1\d{10}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    if (code.length < 4) {
      toast.error("请输入验证码");
      return;
    }
    // 演示：注册/登录成功统一进会员选择页
    toast.success("注册成功，请选择会员身份");
    navigate({ to: "/auth/plan", search: { phone } });
  };

  return (
    <MobileShell>
      <div className="flex flex-col items-center pt-14">
        <div className="text-2xl font-bold">东大门订货通</div>
        <div className="mt-1 text-xs text-muted-foreground">为东大门买手 & B 端而生</div>
      </div>

      <div className="mt-10 space-y-3 px-6">
        <div className="flex gap-2">
          <Input
            placeholder="手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            inputMode="numeric"
          />
          <Button
            variant="outline"
            className="shrink-0"
            onClick={sendCode}
            disabled={cd > 0}
          >
            {cd > 0 ? `${cd}s` : sent ? "重新发送" : "获取验证码"}
          </Button>
        </div>
        <Input
          placeholder="验证码"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
        />
        <Button
          className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white"
          onClick={submit}
        >
          注册 / 登录
        </Button>
        <div className="text-center text-[11px] text-muted-foreground">
          注册即代表同意 <Link to="/" className="underline">服务协议</Link> 与隐私政策
        </div>
      </div>
    </MobileShell>
  );
}
