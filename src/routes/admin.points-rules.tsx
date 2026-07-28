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
          <p className="text-xs text-muted-foreground">1 元消费 = 1 积分（基础比例）；100 积分 = ¥1 抵扣。改动即刻生效，不追溯历史。</p>
        </div>
        <Button size="sm" onClick={() => toast.success("积分规则已保存")}><Save className="mr-1 h-4 w-4" />保存全部</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RuleCard title="下单消费积分" desc="订单实付人民币金额按比例发放，付费会员享加成" defaultOn>
          <NumberField label="基础比例（每元）" defaultValue={1} suffix="分（=1%）" />
          <NumberField label="单笔封顶" defaultValue={0} suffix="分（0 不限）" />
          <NumberField label="到账延迟" defaultValue={14} suffix="天（签收后释放）" />
        </RuleCard>

        <RuleCard title="拼单成团奖励" desc="激励发起人拉团" defaultOn>
          <NumberField label="发起人加成" defaultValue={1} suffix="% × 实付" />
          <NumberField label="每人上限次数" defaultValue={5} suffix="次/日" />
        </RuleCard>

        <RuleCard title="多件购买" desc="单笔≥N 件额外奖励，鼓励客单价" defaultOn>
          <NumberField label="件数门槛" defaultValue={2} suffix="件" />
          <NumberField label="额外加成" defaultValue={1} suffix="% × 实付" />
        </RuleCard>

        <RuleCard title="分享种草" desc="小红书 / 抖音 图文分享回填链接审核通过后发放" defaultOn>
          <NumberField label="每次奖励" defaultValue={50} suffix="分" />
          <NumberField label="每月上限" defaultValue={10} suffix="次" />
        </RuleCard>

        <RuleCard title="邀请好友" desc="被邀人完成首单且售后期结束后发放" defaultOn>
          <NumberField label="被邀人注册奖励" defaultValue={50} suffix="分" />
          <NumberField label="被邀人首单奖励" defaultValue={100} suffix="分" />
          <NumberField label="单月最多邀请" defaultValue={20} suffix="人" />
        </RuleCard>

        <RuleCard title="积分消耗" desc="控制积分出口比例，避免通胀" defaultOn>
          <NumberField label="现金抵扣比例" defaultValue={100} suffix="分 = ¥1" />
          <NumberField label="单笔最多抵扣" defaultValue={20} suffix="% 订单金额" />
          <NumberField label="抽奖单次消耗" defaultValue={100} suffix="分/次" />
        </RuleCard>

        <RuleCard title="积分有效期" desc="按获得时间到期，过期自动清零" defaultOn>
          <NumberField label="有效期" defaultValue={12} suffix="个月" />
          <NumberField label="到期前提醒" defaultValue={7} suffix="天" />
        </RuleCard>

        <RuleCard title="风控" desc="疑似作弊触发时的处理策略" defaultOn>
          <SelectField label="重复设备" options={["禁止获取", "标记待复核", "正常获取"]} />
          <SelectField label="退款订单" options={["扣回积分", "不发放", "仍发放"]} />
          <SelectField label="同 IP 邀请" options={["拦截", "标记待复核", "放行"]} />
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