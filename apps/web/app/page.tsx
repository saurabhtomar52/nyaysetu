"use client";

import { FormEvent, useState } from "react";

const aiApi = process.env.NEXT_PUBLIC_AI_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [district, setDistrict] = useState("");
  const [cnr, setCnr] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function searchDistrict(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${aiApi}/api/v1/advocates?district=${encodeURIComponent(district)}`);
      if (!response.ok) throw new Error("District search failed");
      const advocates = await response.json() as Array<{ name: string; district: string; practice_areas: string[] }>;
      setResult(advocates.length ? advocates.map((item) => `${item.name} — ${item.district}`).join("\n") : "No verified advocates found.");
    } catch { setResult("The district service is unavailable. Try again shortly."); }
    finally { setLoading(false); }
  }

  async function lookupCnr(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${aiApi}/api/v1/cases/${encodeURIComponent(cnr)}`);
      const data = await response.json() as { detail?: string; status?: string; court?: string };
      setResult(response.ok ? `${data.status} — ${data.court}` : data.detail ?? "Lookup failed");
    } catch { setResult("The case service is unavailable. Try again shortly."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <strong className="text-xl tracking-tight">Nyaya<span className="text-saffron">Connect</span></strong>
      <span className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">LEGAL ACCESS LAB</span>
    </nav>
    <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-16 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="mb-5 font-semibold uppercase tracking-[0.25em] text-saffron">For India. With clarity.</p>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight md:text-7xl">Justice starts with finding your way.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Explore legal professionals, understand case status, and learn the language of law with a responsible AI assistant.</p>
      </div>
      <div className="rounded-3xl bg-ink p-7 text-white shadow-xl">
        <h2 className="text-2xl font-semibold">Find a verified advocate</h2>
        <p className="mt-2 text-sm text-slate-300">Search by district. Results are illustrative until your PostGIS dataset is connected.</p>
        <form onSubmit={searchDistrict} className="mt-6 flex gap-2">
          <input required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. New Delhi" className="min-w-0 flex-1 rounded-xl px-4 py-3 text-ink" />
          <button disabled={loading} className="rounded-xl bg-saffron px-4 font-semibold disabled:opacity-60">Search</button>
        </form>
        <form onSubmit={lookupCnr} className="mt-8 border-t border-white/20 pt-6">
          <label htmlFor="cnr" className="text-sm font-semibold">16-digit CNR lookup</label>
          <div className="mt-2 flex gap-2">
            <input id="cnr" required minLength={16} maxLength={16} value={cnr} onChange={(e) => setCnr(e.target.value)} placeholder="Enter CNR number" className="min-w-0 flex-1 rounded-xl px-4 py-3 text-ink" />
            <button disabled={loading} className="rounded-xl border border-white/50 px-4 font-semibold disabled:opacity-60">Lookup</button>
          </div>
        </form>
        {result && <pre className="mt-6 whitespace-pre-wrap rounded-xl bg-white/10 p-4 text-sm">{result}</pre>}
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-20 md:grid-cols-3">
      {["District discovery", "CNR case lookup", "Persona-aware AI"].map((title, index) => <article key={title} className="rounded-2xl border border-orange-100 bg-white p-6"><span className="text-3xl">0{index + 1}</span><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Built as a transparent, observable learning lab for modern LegalTech.</p></article>)}
    </section>
  </main>;
}

