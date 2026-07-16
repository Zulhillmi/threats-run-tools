import { clearSessionCookie, json, type PagesContext } from "../../_shared";

export async function onRequestPost() {
  return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie() } });
}
