import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ORDERS, STATUS_LABEL, formatCNY } from "@/lib/mock-data";
import { ArrowLeft, Ban, Snowflake, KeyRound, MessageSquare, Coins, Tag, MapPin, Users2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id")({
  head: () => ({ meta: [{ title: "用户详情 · 运营后台" }] }),
  component: UserDetail,
});

type Log = { at: string; by: string; action: string; detail?: string };

const POINTS_LOG = [
  { at: "2026-07-18 10:22", type: "订单奖励", change: +120, balance: 3240, note: "订单 SO-2026-0713 完成" },
  { at: "2026-07-15 21:04", type: "邀请奖励", change: +300, balance: 3120, note: "邀请 U1021 首单达成" },
  { at: "2026-07-10 14:08", type: "签到", change: +10, balance: 2820, note: "连续签到 7 天" },
  { at: "2026-07-02 09:11", type: "运费抵扣", change: -500, balance: 2810, note: "订单 SO-2026-0702 抵扣 5 元" },
];

const EXCHANGES = [
  { id: "EX-20260710-01", createdAt: "2026-07-10", status: "已完成", reason: "尺码偏小" },
  { id: "EX-20260618-04", createdAt: "2026-06-18", status: "档口交换中", reason: "线头明显" },
];

const ADDRESSES = [
  { name: "陈小姐", phone: "138****2211", region: "上海市 浦东新区", detail: "张江高科技园区 XX 路 88 号", default: true },
  { name: "陈小姐", phone: "138****2211", region: "浙江省 杭州市", detail: "西湖区文三路 300 号", default: false },
];

function UserDetail() {
  const { id } = Route.useParams();
  const [status, setStatus] = useState<"active" | "frozen">("active");
  const [banned, setBanned] = useState<{ reason: string; at: string } | null>(null);
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>(["高价值", "邀请达人"]);
  const [newTag, setNewTag] = useState("");
  const [logs, setLogs] = useState<Log[]>([
    { at: "2026-07-15 10:22", by: "admin", action: "添加标签", detail: "邀请达人" },
    { at: "2026-06-30 18:03", by: "admin", action: "调整积分", detail: "+200（补偿断货）" },
  ]);

  const orders = ORDERS.slice(0, 4);
  const addLog = (action: string, detail?: string) =>
    setLogs((p) => [{ at: new Date().toISOString().slice(0, 16).replace("T", " "), by: "admin", action, detail }, ...p]);

  const toggleFreeze = () => {
    const next = status === "active" ? "frozen" : "active";
    setStatus(next);
    addLog(next === "frozen" ? "冻结账号" : "解冻账号");
    toast.success(next === "frozen" ? "已冻结账号" : "已解冻账号");
  };

  const confirmBan = () => {
    if (!banReason.trim()) return toast.error("请填写禁购原因");
    const at = new Date().toISOString().slice(0, 16).replace("T", " ");
    setBanned({ reason: banReason.trim(), at });
    addLog("禁止下单", banReason.trim());
    setBanOpen(false); setBanReason("");
    toast.success("已禁止该用户下单");
  };

  const liftBan = () => { setBanned(null); addLog("解除禁购"); toast.success("已解除禁购"); };

  const addTag = () => {
    const t = newTag.trim(); if (!t) return;
    if (tags.includes(t)) return toast.error("标签已存在");
    setTags((p) => [...p, t]); addLog("添加标签", t); setNewTag("");
  };
  const removeTag = (t: string) => { setTags((p) => p.filter((x) => x !== t)); addLog("移除标签", t); };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/users" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回用户列表
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/users/$id/points" params={{ id }}>
            <Button size="sm" variant="outline"><Coins className="mr-1 h-4 w-4" />积分调整</Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => { addLog("重置密码"); toast.success("重置密码短信已发送"); }}>
            <KeyRound className="mr-1 h-4 w-4" />重置密码
          </Button>
          <Button size="sm" variant={status === "active" ? "outline" : "default"} onClick={toggleFreeze}>
            <Snowflake className="mr-1 h-4 w-4" />{status === "active" ? "冻结账号" : "解冻账号"}
          </Button>
          {banned ? (
            <Button size="sm" variant="ghost" onClick={liftBan}>解除禁购</Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setBanOpen(true)}>
              <Ban className="mr-1 h-4 w-4" />禁止下单
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 资料卡 */}
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">陈</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">陈**</span>
                <Badge variant="outline">黄金会员</Badge>
                <Badge variant={status === "active" ? "default" : "destructive"}>{status === "active" ? "正常" : "冻结"}</Badge>
                {banned && <Badge variant="destructive">禁购</Badge>}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{id} · 138****2211</div>
            </div>
          </div>
          {banned && (
            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
              禁购原因：{banned.reason}<br />时间：{banned.at}
            </div>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="注册时间" value="2024-03-15" />
            <Row label="最近登录" value="2026-07-19 21:33" />
            <Row label="登录 IP" value="180.153.**.**" />
            <Row label="积分余额" value="3,240" />
            <Row label="累计消费" value={formatCNY(48620)} />
            <Row label="下单次数" value="27" />
            <Row label="有效邀请" value="6" />
            <Row label="累计佣金" value={formatCNY(1230)} />
          </dl>
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground"><Tag className="h-3.5 w-3.5" />用户标签</div>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => removeTag(t)} title="点击移除">{t} ×</Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="添加标签" className="h-8" />
              <Button size="sm" onClick={addTag}>+</Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">订单（{orders.length}）</TabsTrigger>
              <TabsTrigger value="points">积分流水</TabsTrigger>
              <TabsTrigger value="exchanges">售后</TabsTrigger>
              <TabsTrigger value="address">收货地址</TabsTrigger>
              <TabsTrigger value="invite">邀请</TabsTrigger>
              <TabsTrigger value="log">操作日志</TabsTrigger>
              <TabsTrigger value="note">备注</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="p-3">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr><Th>订单号</Th><Th>下单时间</Th><Th>状态</Th><Th className="text-right">金额</Th></tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-border">
                        <Td><Link to="/admin/orders/$id" params={{ id: o.id }} className="font-mono text-xs text-primary hover:underline">{o.id}</Link></Td>
                        <Td className="text-xs">{o.createdAt}</Td>
                        <Td><Badge variant="outline">{STATUS_LABEL[o.status]}</Badge></Td>
                        <Td className="text-right">{o.totalCNY ? formatCNY(o.totalCNY) : "—"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            <TabsContent value="points">
              <Card className="p-3">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr><Th>时间</Th><Th>类型</Th><Th className="text-right">变动</Th><Th className="text-right">余额</Th><Th>备注</Th></tr>
                  </thead>
                  <tbody>
                    {POINTS_LOG.map((p, i) => (
                      <tr key={i} className="border-t border-border">
                        <Td className="text-xs">{p.at}</Td>
                        <Td>{p.type}</Td>
                        <Td className={`text-right font-medium ${p.change >= 0 ? "text-emerald-600" : "text-destructive"}`}>{p.change > 0 ? `+${p.change}` : p.change}</Td>
                        <Td className="text-right">{p.balance.toLocaleString()}</Td>
                        <Td className="text-xs text-muted-foreground">{p.note}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            <TabsContent value="exchanges">
              <Card className="p-3">
                {EXCHANGES.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">暂无售后记录</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr><Th>工单号</Th><Th>时间</Th><Th>状态</Th><Th>原因</Th></tr>
                    </thead>
                    <tbody>
                      {EXCHANGES.map((e) => (
                        <tr key={e.id} className="border-t border-border">
                          <Td className="font-mono text-xs">{e.id}</Td>
                          <Td className="text-xs">{e.createdAt}</Td>
                          <Td><Badge variant="outline">{e.status}</Badge></Td>
                          <Td className="text-xs">{e.reason}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card className="p-3">
                <div className="space-y-2">
                  {ADDRESSES.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{a.name}</span>
                          <span className="text-xs text-muted-foreground">{a.phone}</span>
                          {a.default && <Badge variant="secondary">默认</Badge>}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{a.region} · {a.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="invite">
              <Card className="p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <MiniStat icon={<Users2 className="h-4 w-4" />} label="已邀请" value="9" />
                  <MiniStat icon={<Users2 className="h-4 w-4" />} label="有效邀请" value="6" />
                  <MiniStat icon={<Coins className="h-4 w-4" />} label="累计佣金" value={formatCNY(1230)} />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">邀请码：<span className="font-mono">{id.slice(-6).toUpperCase()}</span></div>
              </Card>
            </TabsContent>

            <TabsContent value="log">
              <Card className="p-3">
                <ul className="divide-y divide-border text-sm">
                  {logs.map((l, i) => (
                    <li key={i} className="flex items-start gap-3 py-2">
                      <div className="w-32 shrink-0 text-xs text-muted-foreground">{l.at}</div>
                      <div className="flex-1">
                        <span className="font-medium">{l.action}</span>
                        {l.detail && <span className="ml-2 text-xs text-muted-foreground">{l.detail}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{l.by}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="note">
              <Card className="p-4">
                <div className="mb-2 flex items-center gap-1 text-sm font-semibold"><MessageSquare className="h-4 w-4" />运营备注</div>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="内部备注（其他运营可见）…" className="min-h-24" />
                <div className="mt-2 text-right">
                  <Button size="sm" onClick={() => { addLog("保存备注"); toast.success("已保存"); }}>保存</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>禁止下单</DialogTitle>
            <DialogDescription>禁购后客户端下单/加购/结算会被拦截并展示原因。</DialogDescription>
          </DialogHeader>
          <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="如：刷单、多次拒收、账号异常等" rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmBan}>确认禁止</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>;
}
function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <th className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;