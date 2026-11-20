"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type LoginMethod = "email" | "phone";

function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  const international = compact.startsWith("00")
    ? `+${compact.slice(2)}`
    : compact;
  return /^\+[1-9]\d{7,14}$/.test(international) ? international : null;
}

export default function InscriptionPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [waitingForPhoneConfirmation, setWaitingForPhoneConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!fullName.trim() || !phone.trim() || !event.currentTarget.checkValidity()) {
      setMessage(
        "Veuillez remplir les champs requis et saisir des coordonnées valides. Le mot de passe doit contenir au moins 8 caractères."
      );
      event.currentTarget.reportValidity();
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const authPhone = loginMethod === "phone" ? normalizePhone(phone) : null;
    if (loginMethod === "phone" && !authPhone) {
      setMessage("Pour une connexion par téléphone, saisissez le numéro au format international (+221…).");
      return;
    }

    if (!supabase) {
      setMessage(
        "Configuration Supabase manquante. Vérifiez les variables d’environnement."
      );
      return;
    }

    setLoading(true);
    try {
      const metadata = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
      };
      const { data, error } = await supabase.auth.signUp(
        loginMethod === "email"
          ? {
              email: email.trim().toLowerCase(),
              password,
              options: { data: metadata },
            }
          : {
              phone: authPhone!,
              password,
              options: { channel: "sms", data: metadata },
            }
      );

      if (error) {
        if (loginMethod === "email" && error.code === "email_address_invalid") {
          setMessage(
            "Supabase a rejeté cette adresse pendant sa validation. Vérifiez Authentication > Logs dans votre projet Supabase ; le formulaire a bien transmis l’adresse au format attendu."
          );
        } else if (
          loginMethod === "email" &&
          error.code === "email_address_not_authorized"
        ) {
          setMessage(
            "L’envoi d’e-mails de ce projet Supabase est limité. Configurez un serveur SMTP personnalisé dans les réglages Auth de Supabase."
          );
        } else {
          setMessage("Inscription impossible : " + error.message);
        }
        return;
      }

      if (data.session) {
        router.replace("/?inscription=success");
        router.refresh();
      } else if (loginMethod === "phone") {
        setWaitingForPhoneConfirmation(true);
        setMessage("Un code de confirmation a été envoyé par SMS.");
      } else {
        router.replace("/?inscription=confirmation");
        router.refresh();
      }
    } catch (error) {
      console.error("La création du compte Supabase a échoué.", error);
      setMessage("Une erreur réseau a empêché la création du compte.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneConfirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const authPhone = normalizePhone(phone);
    if (!authPhone || !confirmationCode.trim()) {
      setMessage("Saisissez le code reçu par SMS.");
      return;
    }
    if (!supabase) {
      setMessage("Configuration Supabase manquante. Vérifiez les variables d’environnement.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: authPhone,
        token: confirmationCode.trim(),
        type: "sms",
      });
      if (error) {
        setMessage("Confirmation impossible : " + error.message);
        return;
      }
      router.replace("/panier");
      router.refresh();
    } catch (error) {
      console.error("La confirmation du téléphone a échoué.", error);
      setMessage("Une erreur réseau a empêché la confirmation du téléphone.");
    } finally {
      setLoading(false);
    }
  }

  const awaitingCode = waitingForPhoneConfirmation;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101D35] p-6">
      <form
        onSubmit={awaitingCode ? handlePhoneConfirmation : handleSubmit}
        noValidate
        className="w-full max-w-md rounded-2xl bg-[#FFFEFA] p-8 shadow-xl"
      >
        <Link href="/" className="block text-center text-2xl font-bold text-[#101D35]">
          KËR KHADIM
        </Link>
        <h1 className="mt-3 text-center text-xl font-semibold text-[#263D5B]">
          {awaitingCode ? "Confirmer votre téléphone" : "Créer un compte client"}
        </h1>

        {awaitingCode ? (
          <>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              Saisissez le code envoyé au {normalizePhone(phone)} pour activer votre compte.
            </p>
            <label htmlFor="confirmation-code" className="mb-2 mt-6 block text-sm font-semibold">
              Code reçu par SMS
            </label>
            <input
              id="confirmation-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={10}
              required
              value={confirmationCode}
              onChange={(event) => setConfirmationCode(event.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </>
        ) : (
          <>
            <label htmlFor="full-name" className="mb-2 mt-8 block text-sm font-semibold">
              Nom complet
            </label>
            <input
              id="full-name"
              autoComplete="name"
              required
              maxLength={200}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <label htmlFor="phone" className="mb-2 mt-5 block text-sm font-semibold">
              Téléphone
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+221…"
              required
              maxLength={40}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold">Identifiant de connexion</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
                  <input
                    type="radio"
                    name="login-method"
                    value="email"
                    checked={loginMethod === "email"}
                    onChange={() => setLoginMethod("email")}
                  />
                  E-mail
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
                  <input
                    type="radio"
                    name="login-method"
                    value="phone"
                    checked={loginMethod === "phone"}
                    onChange={() => setLoginMethod("phone")}
                  />
                  Téléphone
                </label>
              </div>
            </fieldset>

            <label htmlFor="email" className="mb-2 mt-5 block text-sm font-semibold">
              Adresse e-mail {loginMethod === "phone" && <span className="font-normal text-gray-500">(facultative)</span>}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required={loginMethod === "email"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <label htmlFor="password" className="mb-2 mt-5 block text-sm font-semibold">
              Mot de passe (8 caractères minimum)
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <label htmlFor="confirm-password" className="mb-2 mt-5 block text-sm font-semibold">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </>
        )}

        {message && (
          <p role="alert" className="mt-4 text-sm text-[#263D5B]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#101D35] p-3 font-semibold text-white hover:bg-[#263D5B] disabled:opacity-50"
        >
          {loading
            ? awaitingCode ? "Confirmation..." : "Création..."
            : awaitingCode ? "Confirmer le téléphone" : "Créer mon compte"}
        </button>

        {!awaitingCode && (
          <p className="mt-5 text-center text-sm text-gray-600">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="font-semibold text-[#8A6A39] underline">
              Se connecter
            </Link>
          </p>
        )}
      </form>
    </main>
  );
}

