import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildContactHtml, buildContactText, validateContactPayload } from "@/lib/contact";
import { takeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function originIsAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const configured = [
    process.env.SITE_URL,
    ...(process.env.ALLOWED_ORIGINS || "").split(","),
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : []),
  ].filter(Boolean).map((value) => String(value).replace(/\/$/, ""));

  return configured.includes(origin.replace(/\/$/, ""));
}

export async function POST(request: Request) {
  if (!originIsAllowed(request)) {
    return NextResponse.json({ message: "This request was blocked for security reasons." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!contentType.includes("application/json") || contentLength > 16_384) {
    return NextResponse.json({ message: "The submitted request is not valid." }, { status: 415 });
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 16_384) throw new Error("Payload too large");
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ message: "The submitted request is not valid." }, { status: 400 });
  }

  const validation = validateContactPayload(payload);
  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }
  if (validation.isBot) {
    return NextResponse.json({ ok: true, message: "Your request has been received." });
  }

  const rateLimit = takeRateLimit(clientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many requests were sent. Please try again later or use WhatsApp." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
  const toEmail = process.env.CONTACT_TO_EMAIL || "asifmumtazk@gmail.com";

  if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
    return NextResponse.json(
      { message: "Email delivery is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    await transporter.sendMail({
      from: { name: process.env.SMTP_FROM_NAME || "Al-Asif Enterprise Website", address: fromEmail },
      to: toEmail,
      replyTo: validation.data.email || undefined,
      subject: `Solar inquiry: ${validation.data.name.replace(/[\r\n]+/g, " ")} — ${validation.data.city.replace(/[\r\n]+/g, " ")}`,
      text: buildContactText(validation.data),
      html: buildContactHtml(validation.data),
    });

    return NextResponse.json({ ok: true, message: "Your request has been emailed successfully." });
  } catch (error) {
    console.error("Contact email delivery failed", error instanceof Error ? error.message : "Unknown SMTP error");
    return NextResponse.json(
      { message: "Email delivery is temporarily unavailable." },
      { status: 502 },
    );
  }
}
