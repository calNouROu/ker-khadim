"use client";

import { useState, type FormEvent } from "react";

type Feedback = {
  success: boolean;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setFeedback({
        success: false,
        message:
          "Vérifiez les champs obligatoires et saisissez une adresse e-mail valide.",
      });
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
      website: String(formData.get("website") || ""),
    };

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseBody: unknown = await response.json();

      if (!isRecord(responseBody)) {
        throw new Error("Réponse inattendue du serveur.");
      }

      if (!response.ok) {
        setFeedback({
          success: false,
          message:
            typeof responseBody.error === "string"
              ? responseBody.error
              : "Le message n’a pas pu être envoyé.",
        });
        return;
      }

      setFeedback({
        success: true,
        message:
          typeof responseBody.message === "string"
            ? responseBody.message
            : "Votre message a été transmis.",
      });
      form.reset();
    } catch (error) {
      console.error("L’envoi du formulaire de contact a échoué.", error);
      setFeedback({
        success: false,
        message:
          "Une erreur de connexion a empêché l’envoi. Réessayez dans quelques instants.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-[#E8DCC2] bg-white p-6 shadow-sm sm:p-8"
    >
      <div aria-hidden="true" className="hidden">
        <label htmlFor="contact-website">Site web</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block text-sm font-semibold text-[#263D5B]"
          >
            Nom complet
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={200}
            className="min-h-12 w-full rounded-xl border border-[#D8C9A8] bg-[#FFFEFA] px-4 text-[#101D35] outline-none focus:border-[#8A6A39] focus:ring-2 focus:ring-[#D5BD91]/40"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block text-sm font-semibold text-[#263D5B]"
          >
            Adresse e-mail
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="min-h-12 w-full rounded-xl border border-[#D8C9A8] bg-[#FFFEFA] px-4 text-[#101D35] outline-none focus:border-[#8A6A39] focus:ring-2 focus:ring-[#D5BD91]/40"
          />
        </div>
        <div>
          <label
            htmlFor="contact-phone"
            className="mb-2 block text-sm font-semibold text-[#263D5B]"
          >
            Téléphone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={40}
            className="min-h-12 w-full rounded-xl border border-[#D8C9A8] bg-[#FFFEFA] px-4 text-[#101D35] outline-none focus:border-[#8A6A39] focus:ring-2 focus:ring-[#D5BD91]/40"
          />
        </div>
        <div>
          <label
            htmlFor="contact-subject"
            className="mb-2 block text-sm font-semibold text-[#263D5B]"
          >
            Objet
          </label>
          <input
            id="contact-subject"
            name="subject"
            required
            maxLength={200}
            className="min-h-12 w-full rounded-xl border border-[#D8C9A8] bg-[#FFFEFA] px-4 text-[#101D35] outline-none focus:border-[#8A6A39] focus:ring-2 focus:ring-[#D5BD91]/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="mb-2 block text-sm font-semibold text-[#263D5B]"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            className="w-full resize-y rounded-xl border border-[#D8C9A8] bg-[#FFFEFA] px-4 py-3 text-[#101D35] outline-none focus:border-[#8A6A39] focus:ring-2 focus:ring-[#D5BD91]/40"
          />
        </div>
      </div>

      {feedback && (
        <p
          role={feedback.success ? "status" : "alert"}
          className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${
            feedback.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#101D35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#263D5B] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
