export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMSProvider {
  sendSMS(to: string, message: string): Promise<SMSResult>;
}

/**
 * Console provider — logs SMS to terminal instead of sending.
 * Used during development and testing.
 */
class ConsoleProvider implements SMSProvider {
  async sendSMS(to: string, message: string): Promise<SMSResult> {
    console.log(`\n📱 [SMS] To: ${to}`);
    console.log(`   Message: ${message}`);
    console.log(`   (Console mock — not actually sent)\n`);
    return { success: true, messageId: `console-${Date.now()}` };
  }
}

/**
 * Twilio provider — sends real SMS via Twilio API.
 */
class TwilioProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || "";

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error(
        "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER."
      );
    }
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");

      const body = new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: message,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return { success: true, messageId: data.sid };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Create an SMS provider based on environment configuration.
 */
export function createSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || "console";

  switch (provider) {
    case "twilio":
      return new TwilioProvider();
    case "console":
    default:
      return new ConsoleProvider();
  }
}
