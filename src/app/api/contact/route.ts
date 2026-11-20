type ContactMessage = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseContactMessage(value: unknown): ContactMessage | null {
  if (!isRecord(value) || typeof value.website !== "string") return null;
  if (value.website.trim()) return null;

  const { name, email, phone, subject, message } = value;
  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.trim().length > 200 ||
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof phone !== "string" ||
    phone.trim().length === 0 ||
    phone.trim().length > 40 ||
    typeof subject !== "string" ||
    subject.trim().length === 0 ||
    subject.trim().length > 200 ||
    typeof message !== "string" ||
    message.trim().length < 10 ||
    message.trim().length > 5000
  ) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    subject: subject.trim(),
    message: message.trim(),
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return Response.json(
          { error: "Requête non autorisée." },
          { status: 403 }
        );
      }
    } catch {
      return Response.json({ error: "Origine invalide." }, { status: 403 });
    }
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  const contact = parseContactMessage(payload);
  if (!contact) {
    return Response.json(
      { error: "Vérifiez les champs du formulaire et réessayez." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !recipient || !sender) {
    return Response.json(
      {
        error:
          "Le formulaire de contact n’est pas encore configuré. L’équipe doit finaliser sa configuration avant de pouvoir recevoir votre message.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: contact.email,
        subject: `KËR KHADIM — ${contact.subject}`,
        text: [
          `Nom : ${contact.name}`,
          `E-mail : ${contact.email}`,
          `Téléphone : ${contact.phone}`,
          "",
          contact.message,
        ].join("\n"),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Resend rejected a contact message.", response.status);
      return Response.json(
        { error: "L’envoi du message a échoué. Réessayez plus tard." },
        { status: 502 }
      );
    }

    return Response.json({
      message: "Votre message a bien été envoyé. Merci de nous avoir contactés.",
    });
  } catch (error) {
    console.error(
      "The contact message could not reach Resend.",
      error instanceof Error ? error.message : "Unknown network error"
    );
    return Response.json(
      { error: "Le service d’envoi est momentanément indisponible." },
      { status: 502 }
    );
  }
}
