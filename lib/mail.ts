import { absoluteUrl } from "@/lib/utils";

type MailResult = {
  sent: boolean;
  devUrl?: string;
  devOtp?: string;
  reason?: "not-configured" | "failed";
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

function otpEmailShell(otp: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Your OMNEXA verification code</title>
  </head>
  <body style="margin:0;padding:0;background:#F7FAF5;font-family:Arial,Helvetica,sans-serif;color:#17251B;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7FAF5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #E2EADD;">
            <tr>
              <td style="background:#063B20;color:#ffffff;padding:28px 32px;">
                <div style="letter-spacing:6px;font-size:18px;font-weight:700;">OMNEXA</div>
                <div style="color:#A8D916;font-size:10px;letter-spacing:2px;margin-top:6px;">BEAUTY &amp; JEWELLERY</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.2;margin:0 0 16px;font-weight:400;">Your verification code</h1>
                <p style="font-size:14px;line-height:1.7;color:#4B5D50;margin:0;">Use this six-digit code to finish creating your OMNEXA account. It expires in <strong>10 minutes</strong>.</p>
                <div style="margin:26px 0;padding:22px 16px;background:#F7FAF5;border:1px solid #E2EADD;text-align:center;">
                  <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#718073;margin-bottom:10px;">Verification code</div>
                  <div style="font-size:34px;line-height:1.1;letter-spacing:8px;font-weight:700;color:#063B20;">${otp}</div>
                </div>
                <p style="font-size:14px;line-height:1.7;color:#4B5D50;margin:0 0 14px;">Enter the code on the OMNEXA verification page. For your security, do not share this code with anyone. OMNEXA will never ask you for it.</p>
                <p style="font-size:12px;line-height:1.7;color:#718073;margin:0;">If you did not request this, you can safely ignore this email. No account is created until the code is verified.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#F7FAF5;border-top:1px solid #E2EADD;">
                <p style="font-size:11px;line-height:1.6;color:#718073;margin:0;">OMNEXA &middot; Beauty, skincare, makeup and jewellery.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  devUrl?: string;
  devOtp?: string;
}): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[OMNEXA email preview] ${input.subject} → ${input.to}${input.devOtp ? `\nOTP: ${input.devOtp}` : ""}${input.devUrl ? `\n${input.devUrl}` : ""}`,
      );
      return {
        sent: false,
        devUrl: input.devUrl,
        devOtp: input.devOtp,
        reason: "not-configured",
      };
    }
    console.error(
      "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM for production email.",
    );
    return { sent: false, reason: "not-configured" };
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
      return {
        sent: false,
        devUrl: input.devUrl,
        devOtp: input.devOtp,
        reason: "failed",
      };
    }
    return { sent: true };
  } catch (error) {
    console.error("Could not send email:", error);
    return {
      sent: false,
      devUrl: input.devUrl,
      devOtp: input.devOtp,
      reason: "failed",
    };
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

export async function sendRegistrationOtpEmail(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: "Your OMNEXA verification code",
    html: otpEmailShell(otp),
    devOtp: otp,
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
