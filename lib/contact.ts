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

const ALLOWED_PROPERTY_TYPES = new Set([
  "House",
  "Apartment",
  "Shop",
  "Office",
  "Commercial building",
  "Industrial facility",
  "Other",
]);

export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
export const MAX_ATTACHMENTS_TOTAL_BYTES = 8 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);
const MAX_FILENAME_LENGTH = 180;

const EXTENSION_MIME_FALLBACK: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heic",
  pdf: "application/pdf",
};

export type ContactAttachment = { filename: string; content: string };

type AttachmentValidationResult =
  | { ok: true; attachments: ContactAttachment[] }
  | { ok: false; message: string };

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\0/g, "").slice(0, max) : "";
}

// iOS often reports an empty file.type for HEIC photos even though the
// picker filtered correctly, so a declared type that isn't allow-listed
// falls back to the file extension before being rejected.
export function resolveAttachmentType(filename: string, declaredType: string): string {
  const type = typeof declaredType === "string" ? declaredType.trim().toLowerCase() : "";
  if (ALLOWED_ATTACHMENT_TYPES.has(type)) return type;
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME_FALLBACK[extension] || type;
}

export function validateAttachments(payload: unknown): AttachmentValidationResult {
  if (payload === undefined || payload === null) return { ok: true, attachments: [] };
  if (!Array.isArray(payload)) {
    return { ok: false, message: "Attachments could not be read. Please try again." };
  }
  if (payload.length > MAX_ATTACHMENTS) {
    return { ok: false, message: `You can attach up to ${MAX_ATTACHMENTS} files.` };
  }

  const attachments: ContactAttachment[] = [];
  let totalBytes = 0;

  for (const item of payload) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ok: false, message: "One of the attached files could not be read. Please re-select your files." };
    }
    const record = item as Record<string, unknown>;
    const rawFilename = typeof record.filename === "string" ? record.filename : "attachment";
    const filename = clean(rawFilename, MAX_FILENAME_LENGTH).replace(/[\r\n\t]+/g, " ") || "attachment";
    const declaredType = typeof record.mimeType === "string" ? record.mimeType : "";
    const mimeType = resolveAttachmentType(rawFilename, declaredType);
    const content = typeof record.content === "string" ? record.content.trim() : "";

    if (!ALLOWED_ATTACHMENT_TYPES.has(mimeType)) {
      return { ok: false, message: `"${filename}" is not a supported file type. Please attach a JPG, PNG, WEBP, HEIC or PDF file.` };
    }
    if (!content || content.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
      return { ok: false, message: `"${filename}" could not be read. Please try re-selecting the file.` };
    }

    const padding = content.endsWith("==") ? 2 : content.endsWith("=") ? 1 : 0;
    const byteLength = (content.length / 4) * 3 - padding;

    if (byteLength <= 0) {
      return { ok: false, message: `"${filename}" appears to be empty. Please choose a different file.` };
    }
    if (byteLength > MAX_ATTACHMENT_BYTES) {
      return { ok: false, message: `"${filename}" is larger than 4MB. Please choose a smaller file, or use the "Continue on WhatsApp" button instead.` };
    }

    totalBytes += byteLength;
    if (totalBytes > MAX_ATTACHMENTS_TOTAL_BYTES) {
      return { ok: false, message: 'Your attached files add up to more than 8MB combined. Please remove one, or use the "Continue on WhatsApp" button instead.' };
    }

    attachments.push({ filename, content });
  }

  return { ok: true, attachments };
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

  if (!data.name || data.name.length < 2 || !data.phone || data.phone.length < 7 || !data.city) {
    return { ok: false, message: "Please complete your name, phone, city and property type." };
  }
  if (!ALLOWED_PROPERTY_TYPES.has(data.property)) {
    return { ok: false, message: "Please select a valid property type." };
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

export function buildContactText(data: ContactSubmission, attachmentNames: string[] = []) {
  return [
    "New solar consultation request from the Al-Asif Enterprise website",
    "",
    ...labels.map(([key, label]) => `${label}: ${data[key] || "Not provided"}`),
    ...(attachmentNames.length ? [`Attachments: ${attachmentNames.join(", ")}`] : []),
  ].join("\n");
}

export function buildContactHtml(data: ContactSubmission, attachmentNames: string[] = []) {
  const rows = labels.map(([key, label]) => `
    <tr>
      <th style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top;color:#062b45">${label}</th>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#334155;white-space:pre-wrap">${escapeHtml(data[key] || "Not provided")}</td>
    </tr>`).join("");

  const attachmentRow = attachmentNames.length ? `
    <tr>
      <th style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top;color:#062b45">Attachments</th>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#334155">${escapeHtml(attachmentNames.join(", "))}</td>
    </tr>` : "";

  return `<!doctype html>
  <html><body style="margin:0;background:#f7f6f1;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:680px;margin:32px auto;padding:28px;background:#ffffff;border-top:5px solid #ff9300">
      <p style="margin:0 0 8px;color:#ff9300;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Al-Asif Enterprise</p>
      <h1 style="margin:0 0 22px;color:#062b45;font-size:24px">New solar consultation request</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}${attachmentRow}</table>
      <p style="margin:22px 0 0;color:#64748b;font-size:12px">Sent securely from the company website contact form.</p>
    </div>
  </body></html>`;
}
