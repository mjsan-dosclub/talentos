import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getOutboxLedger } from "@/lib/email-service";
import { getSystemConfig } from "@/lib/config";
import { requireSuperAdmin } from "@/lib/api-auth";

export async function GET() {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  const config = getSystemConfig();
  const outbox = getOutboxLedger();
  return NextResponse.json({
    emailConfig: {
      provider: config.email?.provider,
      fromAddress: config.email?.fromAddress,
      fromName: config.email?.fromName,
      globalCc: config.email?.globalCc,
      enabled: config.email?.enabled,
      hasResendApiKey: Boolean(config.email?.resendApiKey || process.env.RESEND_API_KEY),
      hasSmtpHost: Boolean(config.email?.smtpHost),
    },
    outboxLedgerCount: outbox.length,
    recentEmails: outbox.slice(0, 10),
  });
}

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const testRecipient = body.recipient || body.to;

    if (!testRecipient || !testRecipient.includes("@")) {
      return NextResponse.json(
        { error: "A valid test recipient email address is required." },
        { status: 400 }
      );
    }

    const config = getSystemConfig();
    const subject = body.subject || `[TalentOS Test] Email Gateway Verification (${new Date().toLocaleTimeString("en-IN")})`;
    const customMessage = body.message || "This is a live test transmission from TalentOS to verify outgoing email delivery and automatic Global CC inclusion.";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <div style="background: #0f172a; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 16px;">TalentOS Email Gateway Verification</h3>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello,</p>
        <p style="font-size: 14px; color: #334155;">${customMessage}</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; font-size: 12px; font-family: monospace; color: #1e293b;">
          <strong>Configured Provider:</strong> ${config.email?.provider || "smtp"}<br/>
          <strong>Sender:</strong> ${config.email?.fromName} &lt;${config.email?.fromAddress}&gt;<br/>
          <strong>Global CC:</strong> ${config.email?.globalCc || "(None)"}<br/>
          <strong>Timestamp:</strong> ${new Date().toISOString()}
        </div>
        <p style="font-size: 12px; color: #64748b;">
          If you received this email, outbound delivery and Global CC routing are functioning normally.
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: testRecipient,
      subject,
      text: customMessage,
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Test email dispatched to ${testRecipient}`,
      dispatchResult: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch test email" },
      { status: 500 }
    );
  }
}
