/**
 * Triggerly Email Notification System
 * Branded HTML email alerts via Resend, matching the Triggerly dark SaaS design system.
 */

import { Resend } from 'resend'

let resend = null

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY not set — email notifications disabled')
      return null
    }
    resend = new Resend(apiKey)
  }
  return resend
}

/**
 * Send a branded alert email when a trigger condition is met.
 *
 * @param {string} userEmail — recipient email address
 * @param {object} trigger  — trigger object (name, target, type, condition, value)
 * @param {number} detectedValue — the value that caused the trigger to fire
 */
export async function sendAlertEmail(userEmail, trigger, detectedValue) {
  const client = getResend()
  if (!client) return

  const fromEmail = process.env.FROM_EMAIL || 'alerts@triggerly.app'
  const dashboardUrl = (process.env.APP_URL || 'http://localhost:5173') + '/dashboard'
  const now = new Date()

  // Format the detected value for display
  const formattedValue = trigger.type === 'domain'
    ? 'Available'
    : `$${Number(detectedValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Format the trigger threshold for context
  const thresholdText = trigger.type === 'domain'
    ? 'becomes available'
    : `${trigger.condition === '<' ? 'drops below' : 'goes above'} $${Number(trigger.value).toLocaleString()}`

  // Timestamp
  const timestamp = now.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Type-specific accent colours for the detail rows
  const typeAccent = {
    crypto: { label: 'Crypto', icon: '₿', color: '#F59E0B' },
    stock:  { label: 'Stock',  icon: '📈', color: '#22C55E' },
    domain: { label: 'Domain', icon: '🌐', color: '#A78BFA' },
  }[trigger.type] || { label: 'Alert', icon: '⚡', color: '#00FF9C' }

  // ─── Branded HTML Template ───────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>Trigger Activated — ${trigger.name}</title>
  <!--[if mso]>
  <style>body,table,td{font-family:Arial,Helvetica,sans-serif!important}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#050510;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">

  <!-- Outer wrapper – centres the email -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050510;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">

        <!-- Email container (600px max) -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ── Logo + Brand ── -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#00FF9C,#7C3AED);border-radius:12px;padding:10px 12px;vertical-align:middle;">
                    <span style="font-size:16px;line-height:1;color:#050510;font-weight:700;">⚡</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">Triggerly</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Headline ── -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#FFFFFF;line-height:1.3;">Your trigger was activated</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#6B7280;line-height:1.5;">We detected a condition match. Here are the details.</p>
            </td>
          </tr>

          <!-- ── Alert Card ── -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;border:1px solid #1a1f36;border-radius:16px;">

                <!-- Top badge row -->
                <tr>
                  <td style="padding:28px 28px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color:rgba(0,255,156,0.08);border:1px solid rgba(0,255,156,0.2);border-radius:100px;padding:5px 14px;">
                          <span style="font-size:11px;font-weight:600;color:#00FF9C;text-transform:uppercase;letter-spacing:1.2px;">🔔&nbsp; Trigger Activated</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Trigger name -->
                <tr>
                  <td style="padding:20px 28px 4px;">
                    <h2 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.3;">${trigger.name}</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 24px;">
                    <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5;">${trigger.target} ${thresholdText}</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 28px;">
                    <div style="height:1px;background-color:#1a1f36;"></div>
                  </td>
                </tr>

                <!-- Detail rows -->
                <tr>
                  <td style="padding:20px 28px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <!-- Row: Type -->
                      <tr>
                        <td style="padding:8px 0;vertical-align:middle;">
                          <span style="font-size:12px;color:#6B7280;">Type</span>
                        </td>
                        <td align="right" style="padding:8px 0;vertical-align:middle;">
                          <span style="font-size:13px;color:${typeAccent.color};font-weight:600;">${typeAccent.icon}&nbsp; ${typeAccent.label}</span>
                        </td>
                      </tr>
                      <!-- Row: Detected Value -->
                      <tr>
                        <td style="padding:8px 0;vertical-align:middle;border-top:1px solid #141828;">
                          <span style="font-size:12px;color:#6B7280;">Detected Value</span>
                        </td>
                        <td align="right" style="padding:8px 0;vertical-align:middle;border-top:1px solid #141828;">
                          <span style="font-size:18px;color:#00FF9C;font-weight:700;">${formattedValue}</span>
                        </td>
                      </tr>
                      <!-- Row: Time -->
                      <tr>
                        <td style="padding:8px 0;vertical-align:middle;border-top:1px solid #141828;">
                          <span style="font-size:12px;color:#6B7280;">Time</span>
                        </td>
                        <td align="right" style="padding:8px 0;vertical-align:middle;border-top:1px solid #141828;">
                          <span style="font-size:13px;color:#D1D5DB;font-weight:500;">${timestamp}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Spacer -->
                <tr><td style="height:24px;"></td></tr>

              </table>
            </td>
          </tr>

          <!-- ── CTA Button ── -->
          <tr>
            <td align="center" style="padding:32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#00FF9C;border-radius:100px;">
                    <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:14px 40px;font-size:14px;font-weight:700;color:#050510;text-decoration:none;letter-spacing:-0.01em;">View in Dashboard&nbsp;&nbsp;→</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Cooldown Notice ── -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;border:1px solid #1a1f36;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;text-align:center;">
                      ⏸️&nbsp; This trigger has been placed on a <span style="color:#EAB308;font-weight:600;">10-minute cooldown</span> to prevent duplicate alerts. It will automatically resume monitoring after the cooldown expires.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer Divider ── -->
          <tr>
            <td style="padding:0 0 24px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#1a1f36 30%,#1a1f36 70%,transparent);"></div>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td align="center">
              <p style="margin:0 0 6px;font-size:13px;color:#4B5563;font-weight:500;">Triggerly</p>
              <p style="margin:0 0 16px;font-size:12px;color:#374151;line-height:1.6;">Turn anything on the internet into an instant trigger.<br/>Crypto prices, stock movements, domain availability — monitored 24/7.</p>
              <p style="margin:0;font-size:11px;color:#1F2937;">© ${now.getFullYear()} Triggerly. All rights reserved.</p>
            </td>
          </tr>

        </table>
        <!-- /container -->

      </td>
    </tr>
  </table>
  <!-- /outer -->

</body>
</html>`

  // ─── Send via Resend ─────────────────────────────────────────────────
  try {
    await client.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Trigger Activated — ${trigger.name}`,
      html,
    })
    console.log(`📧 Alert email sent to ${userEmail} for "${trigger.name}"`)
  } catch (err) {
    // Log but never crash the worker loop
    console.error(`❌ Failed to send email to ${userEmail}:`, err.message)
  }
}
