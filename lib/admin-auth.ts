import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "apne_hq_s";

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET env variable is not set");
  return s;
}

export function createAdminToken(): string {
  const payload = `adm:${Date.now()}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    // Verify HMAC signature
    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    if (sig.length !== expected.length) return false;
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return false;

    // Verify token age — payload is "adm:TIMESTAMP"
    const ts = parseInt(payload.split(":")[1] ?? "", 10);
    if (isNaN(ts) || Date.now() - ts > TOKEN_MAX_AGE_MS) return false;

    return true;
  } catch {
    return false;
  }
}

export function adminCookieName() {
  return COOKIE_NAME;
}
