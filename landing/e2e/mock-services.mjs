// Faux Supabase + faux Resend pour les tests de bout en bout (aucun envoi réel).
// Enregistre chaque appel reçu ; GET /__calls les renvoie, DELETE /__calls les efface.
import http from "node:http";

const PORT = Number(process.env.MOCK_PORT || 4010);
let calls = [];

function lireCorps(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

http
  .createServer(async (req, res) => {
    const body = await lireCorps(req);
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const json = (code, data) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };

    if (url.pathname === "/__calls") {
      if (req.method === "DELETE") calls = [];
      return json(200, calls);
    }

    const entry = {
      method: req.method,
      path: url.pathname + url.search,
      headers: { apikey: req.headers.apikey, authorization: req.headers.authorization, "content-type": req.headers["content-type"] },
      size: body.length,
    };
    if ((req.headers["content-type"] || "").includes("json")) entry.json = JSON.parse(body.toString() || "null");
    calls.push(entry);

    if (url.pathname === "/rest/v1/demandes" && req.method === "POST") return json(201, [{ id: "00000000-0000-4000-8000-" + String(calls.length).padStart(12, "0") }]);
    if (url.pathname.startsWith("/rest/v1/demandes") && req.method === "PATCH") return json(204, null);
    if (url.pathname.startsWith("/storage/v1/object/sign/")) return json(200, { signedURL: "/object/sign/inspirations/test.jpg?token=abc" });
    if (url.pathname.startsWith("/storage/v1/object/")) return json(200, { Key: "inspirations/test.jpg" });
    if (url.pathname === "/emails") return json(200, { id: "email_test" });
    json(404, { error: "inconnu" });
  })
  .listen(PORT, () => console.log(`mock services on ${PORT}`));
