export interface Env {
  AI_API_URL?: string;
  AI_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  PUBLIC_BASE_DOMAIN?: string;
  DB?: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const headers = { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,OPTIONS" };
    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (url.pathname === "/api/health") return new Response(JSON.stringify({ ok: true, service: "kauma-design-api" }), { headers });
    if (url.pathname === "/api/ai" && request.method === "POST") {
      if (!env.AI_API_URL || !env.AI_API_KEY) return new Response(JSON.stringify({ ok:false, error:"AI provider not configured yet." }), { status:501, headers });
      const payload = await request.json();
      const upstream = await fetch(env.AI_API_URL, { method:"POST", headers:{"content-type":"application/json","authorization":`Bearer ${env.AI_API_KEY}`}, body:JSON.stringify(payload) });
      return new Response(await upstream.text(), { status:upstream.status, headers });
    }
    if (url.pathname === "/api/deploy" && request.method === "POST") {
      if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) return new Response(JSON.stringify({ok:false,error:"Cloudflare deployment credentials are not configured yet."}),{status:501,headers});
      return new Response(JSON.stringify({ok:false,error:"Deployment provider adapter is ready for implementation; no deployment has been claimed."}),{status:501,headers});
    }
    return new Response(JSON.stringify({ok:false,error:"Not found"}),{status:404,headers});
  }
};