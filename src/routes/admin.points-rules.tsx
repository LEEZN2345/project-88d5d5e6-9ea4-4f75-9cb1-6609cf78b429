import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/points-rules")({
  head: () => ({ meta: [{ title: "积分规则 · 运营后台" }] }),
  component: AdminPointsRules,
});

function AdminPointsRules() {
  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">积分规则</h1>
          <p className="text-xs text-muted-foreground">配置买手端赚取积分的方式，改动即刻生效，历史流水不追溯。</p>
        </div>
        <Button size="sm" onClick={() => toast.success("积分规则已保存")}><Save className="mr-1 h-4 w-4" />保存全部</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RuleCard title="下单送积分" desc="每笔支付成功订单按人民币金额发放积分" defaultOn>
          <NumberField label="每元获得积分" defaultValue={1} suffix="分" />
          <NumberField label="单笔封顶" defaultValue={200} suffix="分" />
          <NumberField label="到账延迟" defaultValue={7} suffix="天（签收后）" />
        </RuleCard>

        <RuleCard title="邀请好友" desc="被邀人完成首单且无退款后发放" defaultOn>
          <NumberField label="邀请人奖励" defaultValue={500} suffix="分" />
          <NumberField label="被邀人奖励" defaultValue={200} suffix="分" />
          <NumberField label="单月最多邀请" defaultValue={20} suffix="人" />
        </RuleCard>

        <RuleCard title="每日签到" desc="连续签到额外奖励，中断重置" defaultOn>
          <NumberField label="基础签到" defaultValue={5} suffix="分/天" />
          <NumberField label="连续 7 天奖励" defaultValue={50} suffix="分" />
          <NumberField label="连续 30 天奖励" defaultValue={300} suffix="分" />
        </RuleCard>

        <RuleCard title="评价 / 晒单" desc="收货 15 天内完成图文评价" defaultOn={false}>
          <NumberField label="纯文字评价" defaultValue={10} suffix="分" />
          <NumberField label="带图评价（≥3 张）" defaultValue={30} suffix="分" />
          <NumberField label="视频晒单" defaultValue={80} suffix="分" />
        </RuleCard>

        <RuleCard title="积分有效期" desc="按获得时间到期，过期自动清零" defaultOn>
          <NumberField label="有效期" defaultValue={12} suffix="个月" />
          <NumberField label="到期前提醒" defaultValue={7} suffix="天" />
        </RuleCard>

        <RuleCard title="风控" desc="疑似作弊触发时的处理策略" defaultOn>
          <SelectField label="重复设备" options={["禁止获取", "标记待复核", "正常获取"]} />
          <SelectField label="退款订单" options={["扣回积分", "不发放", "仍发放"]} />
        </RuleCard>
      </div>
    </AdminShell>
  );
}

function RuleCard({ title, desc, defaultOn, children }: { title: string; desc: string; defaultOn: boolean; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
        <Switch defaultChecked={defaultOn} />
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

function NumberField({ label, defaultValue, suffix }: { label: string; defaultValue: number; suffix?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <Input type="number" defaultValue={defaultValue} className="max-w-[160px]" />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <select defaultValue={options[0]} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}