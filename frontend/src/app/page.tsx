import Link from "next/link";

const features = [
  ["Advocate directory", "/advocate-directory", "Find advocates by district and practice area."],
  ["eCourts tracker", "/ecourts-tracker", "Look up a case using its 16-character CNR."],
  ["AI assistant", "/ai-assistant", "Learn legal concepts with persona-aware RAG."],
  ["DevOps dashboard", "/devops-dashboard", "Explore the AWS architecture and delivery signals."],
];

export default function ShowcaseHome() {
  return <main>
    <header><p>NYAYACONNECT</p><span>LEGALTECH / DEVOPS PORTFOLIO</span></header>
    <section className="hero"><p>For India. With clarity.</p><h1>Justice starts with finding your way.</h1><p>Explore a responsible, observable LegalTech platform built as a hands-on AWS learning laboratory.</p></section>
    <section className="feature-grid">{features.map(([title, href, description]) => <Link href={href} key={href}><h2>{title}</h2><p>{description}</p></Link>)}</section>
  </main>;
}

