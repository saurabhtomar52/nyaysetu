"use client";

import { useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Database,
  GitCommitHorizontal,
  HardDrive,
  LockKeyhole,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";

type ServiceKey = "edge" | "compute" | "database";

const services = {
  edge: {
    label: "Edge & delivery",
    name: "CloudFront + S3",
    metric: "92.8%",
    detail: "cache hit ratio",
    color: "#f97316",
    icon: Cloud,
  },
  compute: {
    label: "Application compute",
    name: "ECS Fargate",
    metric: "38%",
    detail: "CPU utilization",
    color: "#7c3aed",
    icon: Server,
  },
  database: {
    label: "Data layer",
    name: "RDS PostgreSQL",
    metric: "68%",
    detail: "storage used",
    color: "#0f766e",
    icon: Database,
  },
} satisfies Record<ServiceKey, object>;

const pipelines = [
  { sha: "c0d939b", message: "Implement async legal RAG backend", duration: "3m 42s", time: "18 min ago", scan: "Passed" },
  { sha: "16ca593", message: "Add production CI/CD workflows", duration: "2m 58s", time: "1 hr ago", scan: "Passed" },
  { sha: "b581a93", message: "Provision modular AWS infrastructure", duration: "4m 16s", time: "3 hrs ago", scan: "Passed" },
];

export default function DevopsDashboard() {
  const [selected, setSelected] = useState<ServiceKey>("compute");
  const [showAllPipelines, setShowAllPipelines] = useState(false);
  const active = services[selected];
  const ActiveIcon = active.icon;

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-8 text-slate-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
              <Activity size={15} /> NyayaConnect / observability
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">DevOps control room</h1>
            <p className="mt-3 max-w-2xl text-slate-500">A live-style view of the platform topology, delivery confidence, and responsible infrastructure decisions.</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:self-auto">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> All systems operational
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <div className="rounded-3xl bg-[#101324] p-6 text-white shadow-xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">01 / request path</p>
                <h2 className="mt-2 text-2xl font-bold">Live architecture</h2>
              </div>
              <Network className="text-violet-300" />
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-3 md:flex-row md:items-stretch">
              <TopologyNode icon={Users} label="Users" caption="HTTPS traffic" color="#f8fafc" />
              <FlowArrow />
              <TopologyNode icon={Cloud} label="CloudFront" caption="India edge" color="#fb923c" />
              <FlowArrow />
              <div className="grid w-full gap-3 md:w-auto">
                <TopologyNode icon={HardDrive} label="S3" caption="Static frontend" color="#fbbf24" compact />
                <TopologyNode icon={Server} label="ALB → ECS" caption="FastAPI + chat" color="#a78bfa" compact />
              </div>
              <FlowArrow />
              <TopologyNode icon={Database} label="RDS PostgreSQL" caption="PostGIS + pgvector" color="#2dd4bf" />
            </div>
            <p className="mt-8 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">Traffic is encrypted at the edge, routed through the ALB, and served by private ECS tasks. RDS is never publicly addressable.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Selected service</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="rounded-2xl p-3" style={{ backgroundColor: `${active.color}18`, color: active.color }}><ActiveIcon /></span>
              <div><h2 className="font-bold">{active.name}</h2><p className="text-sm text-slate-500">{active.label}</p></div>
            </div>
            <div className="mt-8 text-5xl font-black tracking-tight">{active.metric}</div>
            <p className="mt-1 text-sm text-slate-500">{active.detail}</p>
            <div className="mt-7 space-y-2">
              {(Object.keys(services) as ServiceKey[]).map((key) => (
                <button key={key} onClick={() => setSelected(key)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${selected === key ? "bg-slate-100 font-bold" : "text-slate-500 hover:bg-slate-50"}`}>
                  {services[key].name}<ArrowRight size={15} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard icon={Server} label="ECS task CPU" value="38%" sub="↓ 6% from last hour" tone="violet" />
          <MetricCard icon={Activity} label="ECS task memory" value="612 MB" sub="61% of 1 GB allocation" tone="blue" />
          <MetricCard icon={HardDrive} label="CloudFront cache hit" value="92.8%" sub="↑ 2.4% this week" tone="orange" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">02 / delivery</p><h2 className="mt-2 text-2xl font-bold">CI/CD pipeline feed</h2></div>
              <GitCommitHorizontal className="text-violet-600" />
            </div>
            <div className="mt-6 divide-y divide-slate-100">
              {pipelines.slice(0, showAllPipelines ? pipelines.length : 2).map((pipeline) => (
                <div key={pipeline.sha} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} /><div><p className="font-semibold">{pipeline.message}</p><p className="mt-1 text-xs text-slate-500"><code className="rounded bg-slate-100 px-1.5 py-0.5">{pipeline.sha}</code> · {pipeline.time}</p></div></div>
                  <div className="flex items-center gap-3 pl-7 text-xs text-slate-500 sm:pl-0"><span>{pipeline.duration}</span><span className="flex items-center gap-1 font-semibold text-emerald-600"><ShieldCheck size={14} /> Trivy {pipeline.scan}</span></div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAllPipelines(!showAllPipelines)} className="mt-4 flex items-center gap-2 text-sm font-bold text-violet-700">{showAllPipelines ? "Show less" : "View deployment history"} <ArrowRight size={15} /></button>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-amber-800"><LockKeyhole size={18} /><p className="text-xs font-bold uppercase tracking-[0.18em]">03 / responsible infrastructure</p></div>
            <h2 className="mt-4 text-2xl font-bold text-amber-950">Compliance by design</h2>
            <div className="mt-6 space-y-5">
              <Callout title="BCI Rule 36 · software layer">Advocate discovery uses only neutral alphabetical or geographic-distance ordering. The platform does not rank advocates by success, endorsements, or paid placement.</Callout>
              <Callout title="DPDP Act 2023 · infrastructure layer">The AWS deployment target is the India region (`ap-south-1`), with private RDS subnets, encryption at rest, and Secrets Manager wiring. Residency is an infrastructure control—not a substitute for a complete legal compliance programme.</Callout>
            </div>
          </div>
        </section>
        <footer className="mt-8 flex items-center gap-2 text-xs text-slate-400"><RefreshCw size={13} /> Mock telemetry refreshes on deployment; connect the least-privilege CloudWatch adapter for live metrics.</footer>
      </div>
    </main>
  );
}

function TopologyNode({ icon: Icon, label, caption, color, compact = false }: { icon: typeof Users; label: string; caption: string; color: string; compact?: boolean }) {
  return <div className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 ${compact ? "px-3 py-2" : "w-full flex-col justify-center px-5 py-4 text-center md:w-40"}`}><span className="rounded-xl bg-white/10 p-2" style={{ color }}><Icon size={compact ? 17 : 21} /></span><div><p className="text-sm font-bold">{label}</p><p className="mt-0.5 text-[10px] text-slate-400">{caption}</p></div></div>;
}

function FlowArrow() {
  return <div className="hidden items-center text-slate-500 md:flex"><ArrowRight size={18} /></div>;
}

function MetricCard({ icon: Icon, label, value, sub, tone }: { icon: typeof Server; label: string; value: string; sub: string; tone: "violet" | "blue" | "orange" }) {
  const colors = { violet: "text-violet-600 bg-violet-50", blue: "text-blue-600 bg-blue-50", orange: "text-orange-600 bg-orange-50" };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><span className={`rounded-lg p-2 ${colors[tone]}`}><Icon size={16} /></span>{label}</div><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></div>;
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="flex items-center gap-2 text-sm font-bold text-amber-900"><TriangleAlert size={15} />{title}</h3><p className="mt-2 text-sm leading-6 text-amber-900/75">{children}</p></div>;
}
