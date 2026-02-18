const TELEGRAM_BOT_TOKEN = "8573082761:AAEA0qcQg1jhTAQoQclzZqBjG_rCUo-aGI8";
const TELEGRAM_CHAT_ID = "8533894665";
const WHATSAPP_NUMBER = "+94741671668";

const requiredFields = [
  "shopName",
  "ownerName",
  "contactNumber",
  "address",
  "packageNumber",
  "packagePrice",
];

function buildSinhalaMessage(data) {
  return [
    "🛍️ *Shop X Lanka නව ඇණවුමක්*",
    "",
    `🏪 කඩ නම: ${data.shopName}`,
    `👤 අයිතිකරු: ${data.ownerName}`,
    `📞 දුරකථන අංකය: ${data.contactNumber}`,
    `📍 ලිපිනය: ${data.address}`,
    `📦 පැකේජ අංකය: ${data.packageNumber}`,
    `💰 පැකේජ මිල: ${data.packagePrice}`,
    "",
    `WhatsApp අංකය: ${WHATSAPP_NUMBER}`,
  ].join("\n");
}

async function sendTelegramMessage(message) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram message failed: ${detail}`);
  }
}

async function sendTelegramPhoto(caption, file) {
  if (!file || file.size === 0) return;

  const body = new FormData();
  body.append("chat_id", TELEGRAM_CHAT_ID);
  body.append("caption", caption);
  body.append("photo", file, file.name || "payment-screenshot.jpg");

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram photo failed: ${detail}`);
  }
}

export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await request.formData();
    const payload = {
      shopName: formData.get("shopName")?.toString().trim() || "",
      ownerName: formData.get("ownerName")?.toString().trim() || "",
      contactNumber: formData.get("contactNumber")?.toString().trim() || "",
      address: formData.get("address")?.toString().trim() || "",
      packageNumber: formData.get("packageNumber")?.toString().trim() || "",
      packagePrice: formData.get("packagePrice")?.toString().trim() || "",
    };

    const missing = requiredFields.filter((field) => !payload[field]);
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `අවශ්‍ය තොරතුරු නොමැත: ${missing.join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const message = buildSinhalaMessage(payload);
    const screenshot = formData.get("paymentScreenshot");

    await sendTelegramMessage(message);
    await sendTelegramPhoto("📸 ගෙවීම් Screenshot", screenshot);

    return new Response(
      JSON.stringify({
        success: true,
        message: "ඇණවුම Telegram වෙත යවා ඇත.",
        whatsappMessage: message,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `දෝෂයක් ඇතිවිය: ${error.message}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
