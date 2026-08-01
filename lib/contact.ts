export type ContactSubmission = {
  name: string;
  phone: string;
  email: string;
  city: string;
  property: string;
  bill: string;
  backup: string;
  preferredContact: string;
  message: string;
};

type ValidationResult =
  | { ok: true; data: ContactSubmission; isBot: boolean }
  | { ok: false; message: string };

const limits: Record<keyof ContactSubmission, number> = {
  name: 100,
  phone: 40,
  email: 254,
  city: 120,
  property: 80,
  bill: 80,
  backup: 80,
  preferredContact: 40,
  message: 2000,
};

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\0/g, "").slice(0, max) : "";
}

export function validateContactPayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, message: "Please submit the consultation form again." };
  }

  const input = payload as Record<string, unknown>;
  const isBot = clean(input.website, 200).length > 0;
  const data = Object.fromEntries(
    Object.entries(limits).map(([key, max]) => [key, clean(input[key], max)]),
  ) as ContactSubmission;

  if (isBot) return { ok: true, data, isBot: true };

  if (!data.name || !data.phone || !data.city || !data.property) {
    return { ok: false, message: "Please complete your name, phone, city and property type." };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, message: "Please enter a valid email address or leave it empty." };
  }
  if (input.consent !== "on" && input.consent !== true && input.consent !== "true") {
    return { ok: false, message: "Please confirm that we may use your details to answer the request." };
  }

  return { ok: true, data, isBot };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}

const labels: Array<[keyof ContactSubmission, string]> = [
  ["name", "Name"],
  ["phone", "Phone / WhatsApp"],
  ["email", "Email"],
  ["city", "City / Area"],
  ["property", "Property"],
  ["bill", "Monthly bill"],
  ["backup", "Backup requirement"],
  ["preferredContact", "Preferred reply"],
  ["message", "Additional details"],
];

export function buildContactText(data: ContactSubmission) {
  return [
    "New solar consultation request from the Al-Asif Enterprise website",
    "",
    ...labels.map(([key, label]) => `${label}: ${data[key] || "Not provided"}`),
  ].join("\n");
}

export function buildContactHtml(data: ContactSubmission) {
  const rows = labels.map(([key, label]) => `
    <tr>
      <th style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top;color:#062b45">${label}</th>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#334155;white-space:pre-wrap">${escapeHtml(data[key] || "Not provided")}</td>
    </tr>`).join("");

  return `<!doctype html>
  <html><body style="margin:0;background:#f7f6f1;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:680px;margin:32px auto;padding:28px;background:#ffffff;border-top:5px solid #ff9300">
      <p style="margin:0 0 8px;color:#ff9300;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Al-Asif Enterprise</p>
      <h1 style="margin:0 0 22px;color:#062b45;font-size:24px">New solar consultation request</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <p style="margin:22px 0 0;color:#64748b;font-size:12px">Sent securely from the company website contact form.</p>
    </div>
  </body></html>`;
}
