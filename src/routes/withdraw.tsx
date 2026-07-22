import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Wallet, ArrowRight, Lock, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/withdraw")({
  head: () => ({ meta: [{ title: "提现 · 东大门订货通" }] }),
  component: Withdraw,
});

// 与 membership.tsx 一致，当前会员为普通会员
const IS_CREATOR = false;
const WITHDRAWABLE = 46.7;

type Method = "alipay" | "wechat" | "bank";

function Withdraw() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("alipay");
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState(WITHDRAWABLE.toFixed(2));

  if (!IS_CREATOR) {
    return (
      <MobileShell>
        <MobileHeader title="提现" back />
        <div className="p-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-400 p-5 text-white shadow-lg">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest opacity-90">
              <Lock className="h-3.5 w-3.5" /> 提现权限未开通
            </div>
            <div className="mt-2 text-xl font-bold">当前为普通会员</div>
            <div className="mt-1 text-[12px] leading-relaxed opacity-90">
              普通会员的返佣仅可用于抵扣自己订单。<br />
              升级为「创作者会员」即可提现到 支付宝 / 微信 / 银行卡，T+1 到账。
            </div>
            <div className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-[12px] backdrop-blur">
              可提现金额 <span className="font-bold tabular-nums">¥{WITHDRAWABLE.toFixed(2)}</span> · 满 ¥50 起提
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Crown className="h-4 w-4 text-rose-500" /> 创作者会员 · ¥199/年
            </div>
            <ul className="mt-2 space-y-1.5 text-[12px] text-muted-foreground">
              <Item>返佣可提现（支付宝 / 微信 / 银行卡）</Item>
              <Item>下单基础积分 1.5x</Item>
              <Item>档口私密价 / 上新优先</Item>
              <Item>专属客服 2h 内响应</Item>
            </ul>
            <Button
              className="mt-3 w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-95"
              onClick={() => navigate({ to: "/membership" })}
            >
              立即升级为创作者会员 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Link
              to="/invite-rules"
              className="mt-2 block text-center text-[11px] text-muted-foreground"
            >
              查看完整分佣规则 →
            </Link>
          </div>

          {/* 预览：升级后可配置的收款账户 */}
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-4 opacity-60">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> 升级后可配置收款账户（预览）
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-lg border border-border bg-card p-2">支付宝</div>
              <div className="rounded-lg border border-border bg-card p-2">微信</div>
              <div className="rounded-lg border border-border bg-card p-2">银行卡</div>
            </div>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <MobileHeader title="提现" back />
      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
          <div className="flex items-center gap-1.5 text-xs opacity-90">
            <Wallet className="h-3.5 w-3.5" /> 可提现金额
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums">¥{WITHDRAWABLE.toFixed(2)}</div>
          <div className="mt-1 text-[11px] opacity-85">满 ¥50 起提 · T+1 到账 · 平台承担手续费</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">选择到账方式</div>
          <div className="grid grid-cols-3 gap-2">
            {(["alipay", "wechat", "bank"] as Method[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-xl border p-2.5 text-xs ${
                  method === m
                    ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                {m === "alipay" ? "支付宝" : m === "wechat" ? "微信" : "银行卡"}
                {method === m && <CheckCircle2 className="mx-auto mt-1 h-3.5 w-3.5" />}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {method === "bank" && (
              <Field label="开户银行" value={bank} onChange={setBank} placeholder="如：招商银行 上海分行" />
            )}
            <Field
              label={method === "alipay" ? "支付宝账号" : method === "wechat" ? "微信收款账号" : "银行卡号"}
              value={account}
              onChange={setAccount}
              placeholder={
                method === "alipay"
                  ? "手机号 / 邮箱"
                  : method === "wechat"
                  ? "微信号 / 绑定手机号"
                  : "16-19 位银行卡号"
              }
            />
            <Field label="收款人姓名" value={name} onChange={setName} placeholder="需与实名认证一致" />
            <div>
              <div className="mb-1 text-xs font-medium">提现金额</div>
              <div className="flex items-center gap-2">
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                  inputMode="decimal"
                />
                <button
                  onClick={() => setAmount(WITHDRAWABLE.toFixed(2))}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  全部
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          · 首次提现需通过实名认证审核（约 1 个工作日）<br />
          · 每日 18:00 前发起，次日 24 点前到账<br />
          · 收款账户信息将加密存储，仅用于本人提现
        </div>

        <Button
          className="w-full"
          disabled={!account || !name || Number(amount) < 50}
          onClick={() => {
            toast.success("提现申请已提交，T+1 到账");
            navigate({ to: "/commission" });
          }}
        >
          确认提现
        </Button>
      </div>
    </MobileShell>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium">{label}</div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}