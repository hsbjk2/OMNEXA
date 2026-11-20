import { absoluteUrl } from "@/lib/utils";

type MailResult = {
  sent: boolean;
  devUrl?: string;
};

function emailShell(title: string, body: string, action: string, url: string) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#F7FAF5;font-family:Arial,Helvetica,sans-serif;color:#17251B;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="background:#063B20;color:#fff;padding:28px 32px;">
        <div style="letter-spacing:6px;font-size:18px;font-weight:700;">OMNEXA</div>
        <div style="color:#A8D916;font-size:10px;letter-spacing:2px;margin-top:6px;">BEAUTY &amp; JEWELLERY</div>
      </div>
      <div style="background:#ffffff;padding:32px;border:1px solid #E2EADD;border-top:0;">
        <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.2;margin:0 0 16px;font-weight:400;">${title}</h1>
        <div style="font-size:14px;line-height:1.7;color:#4B5D50;">${body}</div>
        <a href="${url}" style="display:inline-block;margin-top:24px;background:#A8D916;color:#063B20;text-decoration:none;font-weight:700;font-size:13px;padding:14px 22px;border-radius:2px;">${action}</a>
        <p style="font-size:12px;line-height:1.6;color:#718073;margin-top:28px;">If the button does not work, copy this link into your browser:<br /><span style="word-break:break-all;">${url}</span></p>
      </div>
      <p style="font-size:11px;line-height:1.6;color:#718073;padding-top:18px;text-align:center;">OMNEXA &middot; Beauty, skincare, makeup and jewellery.</p>
    </div>
  </body>
</html>`;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  devUrl?: string;
}): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[OMNEXA email preview] ${input.subject} → ${input.to}${input.devUrl ? `\n${input.devUrl}` : ""}`,
      );
      return { sent: false, devUrl: input.devUrl };
    }
    console.error(
      "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM for production email.",
    );
    return { sent: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Resend email failed:", response.status, text.slice(0, 300));
      return { sent: false, devUrl: input.devUrl };
    }
    return { sent: true };
  } catch (error) {
    console.error("Could not send email:", error);
    return { sent: false, devUrl: input.devUrl };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = absoluteUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  return sendEmail({
    to: email,
    subject: "Verify your OMNEXA account",
    html: emailShell(
      "One small step.",
      "Confirm your email address to finish setting up your OMNEXA account. This link stays valid for 24 hours.",
      "Verify email",
      url,
    ),
    devUrl: url,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = absoluteUrl(
    `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
  );
  return sendEmail({
    to: email,
    subject: "Reset your OMNEXA password",
    html: emailShell(
      "A new password, when you are ready.",
      "Use the link below to set a new password. For your security, it expires in one hour. If you did not request this, you can safely ignore this email.",
      "Set a new password",
      url,
    ),
    devUrl: url,
  });
}
