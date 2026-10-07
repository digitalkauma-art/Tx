import JSZip from "jszip";
import { WebsiteProject, Section } from "../types";

const esc = (s: string = "") => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function sectionHtml(s: Section, b: WebsiteProject["business"], brand: WebsiteProject["brand"]) {
  if (!s.visible) return "";
  const button = s.buttonText ? `<a class="btn" href="${esc(s.buttonHref || "#")}">${esc(s.buttonText)}</a>` : "";
  const text = (s.text || "").split("\n").map(esc).join("<br>");
  if (s.type === "hero") return `<section class="hero"><div><span class="eyebrow">${esc(b.type || "Business")}</span><h1>${esc(s.title)}</h1><p>${text}</p>${button}</div></section>`;
  if (s.type === "services") return `<section><div class="wrap"><h2>${esc(s.title)}</h2><p>${text}</p><div class="grid">${(s.items||[]).map(i=>`<article class="card"><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></article>`).join("")}</div></div></section>`;
  if (s.type === "products") return `<section><div class="wrap"><h2>${esc(s.title)}</h2><p>${text}</p><div class="grid">${(s.items||[]).map(i=>`<article class="card">${i.image?`<img src="${esc(i.image)}" alt="${esc(i.title)}">`:""}<h3>${esc(i.title)}</h3><p>${esc(i.text)}</p>${i.price?`<strong>${esc(i.price)}</strong>`:""}</article>`).join("")}</div></div></section>`;
  if (s.type === "gallery") return `<section><div class="wrap"><h2>${esc(s.title)}</h2><p>${text}</p><div class="gallery">${(s.items||[]).map(i=>i.image?`<img src="${esc(i.image)}" alt="${esc(i.title)}">`:"").join("")}</div></div></section>`;
  if (s.type === "footer") return `<footer><div class="wrap"><strong>${esc(s.title)}</strong><p>${text}</p>${b.whatsapp?`<a href="https://wa.me/${b.whatsapp.replace(/\D/g,"")}">WhatsApp</a>`:""}</div></footer>`;
  return `<section id="${s.type}"><div class="wrap"><h2>${esc(s.title)}</h2><p>${text}</p>${button}</div></section>`;
}

function pageHtml(p: WebsiteProject["pages"][number], project: WebsiteProject) {
  const body = p.sections.map(s=>sectionHtml(s,project.business,project.brand)).join("\n");
  const free = project.freeBranding ? `<div class="kauma-credit">Built with Kauma Design</div>` : "";
  const logo = project.business.logo ? `<img class="logo-img" src="${esc(project.business.logo)}" alt="${esc(project.business.name)} logo">` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.seo.title)}</title><meta name="description" content="${esc(p.seo.description)}"><meta name="keywords" content="${esc(p.seo.keywords)}"><meta name="robots" content="${esc(p.seo.robots)}"><meta property="og:title" content="${esc(p.seo.title)}"><meta property="og:description" content="${esc(p.seo.description)}"><link rel="stylesheet" href="assets/style.css"></head><body><header><div class="nav wrap">${logo}<a class="brand" href="index.html">${esc(project.business.name)}</a><nav>${project.pages.map(x=>`<a href="${x.name==="Home"?"index.html":x.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".html"}">${esc(x.name)}</a>`).join("")}</nav></div></header>${body}<div class="whatsapp">${project.business.whatsapp?`<a href="https://wa.me/${project.business.whatsapp.replace(/\D/g,"")}">WhatsApp</a>`:""}</div>${free}<script src="assets/site.js"></script></body></html>`;
}

const css = (p: WebsiteProject) => `:root{--primary:${p.brand.primary};--gold:${p.brand.secondary};--accent:${p.brand.accent};--white:#f5f7fa;--muted:#718096;--border:#1c2a3d}*{box-sizing:border-box}body{margin:0;font-family:${p.brand.font},Arial,sans-serif;background:#fff;color:#111827;line-height:1.65}header{background:var(--primary);color:var(--white);position:sticky;top:0;z-index:10}.wrap{width:min(1120px,92%);margin:auto}.nav{min-height:72px;display:flex;align-items:center;gap:20px}.brand{font-weight:800;color:var(--white);text-decoration:none}.nav nav{margin-left:auto;display:flex;gap:18px;flex-wrap:wrap}.nav nav a{color:#dce5ef;text-decoration:none}.logo-img{width:42px;height:42px;object-fit:contain}.hero{background:var(--primary);color:var(--white);min-height:62vh;display:grid;place-items:center;padding:80px 4%;text-align:center}.hero>div{max-width:850px}.eyebrow{color:var(--gold);font-weight:800;text-transform:uppercase;letter-spacing:.14em;font-size:.8rem}.hero h1{font-size:clamp(2.5rem,7vw,5rem);line-height:1.05;margin:14px 0}.hero p{font-size:1.15rem;color:#c4cedb}.btn{display:inline-block;background:var(--gold);color:#111;padding:13px 20px;border-radius:9px;text-decoration:none;font-weight:800;margin-top:12px}section{padding:76px 0}.wrap>h2{font-size:clamp(1.8rem,4vw,3rem);margin:0 0 8px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:28px}.card{border:1px solid #e3e8ef;border-radius:16px;padding:24px;background:#fff;box-shadow:0 10px 30px #0a10180d}.card img,.gallery img{width:100%;height:220px;object-fit:cover;border-radius:12px}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}footer{background:var(--primary);color:#cbd5e1;padding:42px 0}.whatsapp{position:fixed;right:20px;bottom:20px;z-index:20}.whatsapp a{background:#12b886;color:white;padding:12px 16px;border-radius:999px;text-decoration:none;font-weight:800}.kauma-credit{text-align:center;font-size:.78rem;color:#6b7280;padding:12px}@media(max-width:760px){.nav{align-items:flex-start;padding:14px 0;flex-wrap:wrap}.nav nav{margin-left:0;width:100%;overflow:auto}.grid,.gallery{grid-template-columns:1fr}.hero{min-height:70vh}section{padding:55px 0}}`;

export async function downloadWebsite(project: WebsiteProject) {
  const zip = new JSZip();
  const assets = zip.folder("assets")!;
  assets.file("style.css", css(project));
  assets.file("site.js", `document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{const el=document.querySelector(a.getAttribute("href"));if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth"})}}));`);
  project.pages.forEach(p=>{
    const filename = p.name === "Home" ? "index.html" : p.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+".html";
    zip.file(filename, pageHtml(p,project));
  });
  const blob = await zip.generateAsync({type:"blob"});
  const url = URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=`${project.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-website.zip`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}