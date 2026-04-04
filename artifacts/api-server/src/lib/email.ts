import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter: nodemailer.Transporter | null = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

export async function sendFanCardEmail(opts: {
  to: string;
  buyerName: string;
  celebName: string;
  cardType: string;
  price: number;
  confirmationNumber: string;
  celebImageUrl: string;
}) {
  if (!transporter) {
    logger.info("Email not configured — skipping fan card email");
    return;
  }

  const tierLabel = opts.cardType.charAt(0).toUpperCase() + opts.cardType.slice(1);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background: #0a0a0a; font-family: 'Georgia', serif; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 24px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 28px; font-weight: bold; color: #FFD700; letter-spacing: 2px; }
    .card-wrapper { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      border: 2px solid #FFD700;
      border-radius: 20px;
      padding: 32px;
      text-align: center;
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
      margin: 24px 0;
      position: relative;
      overflow: hidden;
    }
    .celeb-img { 
      width: 120px; height: 120px; border-radius: 50%; 
      border: 4px solid #FFD700; object-fit: cover; margin-bottom: 16px;
    }
    .buyer-name { font-size: 28px; font-weight: bold; color: #FFD700; margin: 12px 0 4px; }
    .celeb-name { font-size: 18px; color: #e0e0e0; margin-bottom: 8px; }
    .tier-badge { 
      display: inline-block; 
      background: linear-gradient(90deg, #FFD700, #FFA500);
      color: #000; font-weight: bold; font-size: 14px;
      padding: 6px 20px; border-radius: 20px; margin: 8px 0;
    }
    .price { font-size: 22px; color: #FFD700; margin: 8px 0; }
    .order-id { font-size: 12px; color: #888; letter-spacing: 2px; margin-top: 16px; font-family: monospace; }
    .official { font-size: 11px; color: #FFD700; opacity: 0.7; margin-top: 8px; letter-spacing: 3px; }
    .neon-bar { height: 2px; background: linear-gradient(90deg, transparent, #FFD700, transparent); margin: 16px 0; }
    .footer { text-align: center; margin-top: 32px; color: #666; font-size: 12px; }
    .cta { 
      display: inline-block; margin-top: 24px;
      background: #FFD700; color: #000; font-weight: bold;
      padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⭐ CelebFanCards</div>
      <p style="color:#888; font-size:14px;">Your exclusive fan card is ready!</p>
    </div>

    <p style="color:#ccc;">Hey <strong style="color:#FFD700;">${opts.buyerName}</strong>,</p>
    <p style="color:#ccc;">Your official CelebFanCard has been created! Below is your personalized digital fan card:</p>

    <div class="card-wrapper">
      <div class="neon-bar"></div>
      <img src="${opts.celebImageUrl}" alt="${opts.celebName}" class="celeb-img" onerror="this.style.display='none'">
      <div class="buyer-name">${opts.buyerName}</div>
      <div class="celeb-name">Fan of ${opts.celebName}</div>
      <div class="neon-bar"></div>
      <div class="tier-badge">${tierLabel} Fan Card</div>
      <div class="price">$${opts.price.toFixed(2)}</div>
      <div class="order-id">ORDER ID: ${opts.confirmationNumber}</div>
      <div class="official">✦ OFFICIAL CELEBFANCARD — 2026 ✦</div>
      <div class="neon-bar"></div>
    </div>

    <p style="text-align:center; color:#ccc;">Your card is now live in your dashboard. Log in to view your full collection.</p>

    <div style="text-align:center;">
      <a href="https://celebfancards.repl.co/my-cards" class="cta">View My Cards →</a>
    </div>

    <div class="footer">
      <p>Questions? WhatsApp us at <a href="https://wa.me/17732801545" style="color:#FFD700;">+1 (773) 280-1545</a></p>
      <p>Email: <a href="mailto:support@fanCardHub.com" style="color:#FFD700;">support@fanCardHub.com</a></p>
      <p style="margin-top:16px;">© 2026 CelebFanCards. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"CelebFanCards" <${EMAIL_USER}>`,
    to: opts.to,
    subject: `Your Fan Card for ${opts.celebName} is Ready! 🌟`,
    html,
  });

  logger.info({ to: opts.to, celeb: opts.celebName }, "Fan card email sent");
}

export async function sendContactConfirmation(opts: {
  to: string;
  name: string;
}) {
  if (!transporter) return;
  await transporter.sendMail({
    from: `"CelebFanCards Support" <${EMAIL_USER}>`,
    to: opts.to,
    subject: "We received your message — CelebFanCards",
    html: `
      <div style="background:#0a0a0a; font-family:Georgia,serif; color:#fff; padding:32px; max-width:500px; margin:0 auto;">
        <h2 style="color:#FFD700;">Thanks, ${opts.name}!</h2>
        <p>We've received your message and our VIP support team will get back to you within 24 hours.</p>
        <p>In a hurry? WhatsApp us directly at <a href="https://wa.me/17732801545" style="color:#FFD700;">+1 (773) 280-1545</a></p>
        <p style="color:#666; font-size:12px; margin-top:32px;">© 2026 CelebFanCards</p>
      </div>
    `,
  });
}
