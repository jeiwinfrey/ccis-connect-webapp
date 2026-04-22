interface SendSmsParams {
  recipient: string; // +63XXXXXXXXXX
  content: string;
}

const UNISMS_URL = "https://unismsapi.com/api/sms";

export async function sendSms(params: SendSmsParams): Promise<boolean> {
  const apiKey = process.env.UNISMS_API;

  if (!apiKey) {
    console.warn("[SMS] UNISMS_API environment variable is not set. Skipping SMS.");
    return false;
  }

  const authHeader = "Basic " + Buffer.from(apiKey + ":").toString("base64");

  try {
    const response = await fetch(UNISMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        recipient: params.recipient,
        content: params.content,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `[SMS] UniSMS API returned ${response.status}: ${body}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[SMS] Network error sending SMS:", error);
    return false;
  }
}
