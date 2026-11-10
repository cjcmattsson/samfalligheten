import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router";
import { useAuthState } from "../auth/AuthContext";
import { Icon } from "../components/icons";
import { Button, Field, LoadingScreen, inputClass } from "../components/ui";
import { useStore } from "../demo/store";
import { sendLoginLink } from "../lib/board";
import { auth } from "../lib/firebase";

const EMAIL_KEY = "emailForSignIn";

function readSavedEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

function saveEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  } catch {
    // Without storage the page asks for the address again when the link is opened.
  }
}

// The Auth emulator does not send email, so development needs another way to reach the link.
async function findDevLink(email: string) {
  const response = await fetch("http://127.0.0.1:9099/emulator/v1/projects/demo-samfalligheten/oobCodes");
  const { oobCodes } = (await response.json()) as { oobCodes: { email: string; oobLink: string }[] };
  const code = oobCodes.filter((item) => item.email === email).pop();
  return code ? `/logga-in${new URL(code.oobLink).search}` : null;
}

export function LoginPage() {
  const { association } = useStore();
  const state = useAuthState();
  const hasLink = isSignInWithEmailLink(auth, window.location.href);
  const [stage, setStage] = useState(hasLink ? "completing" : "form");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const started = useRef(false);

  async function complete(email: string) {
    setStage("completing");
    setError("");
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      saveEmail(null);
      window.history.replaceState(null, "", "/logga-in");
      setStage("form");
    } catch {
      window.history.replaceState(null, "", "/logga-in");
      setError("Länken är ogiltig eller för gammal. Begär en ny länk nedan.");
      setStage("form");
    }
  }

  useEffect(() => {
    if (!hasLink || started.current) return;
    started.current = true;
    const saved = readSavedEmail();
    if (saved) void complete(saved);
    else setStage("confirm");
  }, [hasLink]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email")).trim().toLowerCase();

    if (stage === "confirm") {
      void complete(email);
      return;
    }

    setBusy(true);
    setError("");
    try {
      await sendLoginLink(email);
      saveEmail(email);
      setSentTo(email);
      setStage("sent");
      if (import.meta.env.DEV) setDevLink(await findDevLink(email));
    } catch {
      setError("Det gick inte att skicka länken. Kontrollera adressen och försök igen.");
    } finally {
      setBusy(false);
    }
  }

  if (state.status === "signedIn") return <Navigate to="/portal" replace />;
  if (stage === "completing" || state.status === "loading") return <LoadingScreen />;

  const denied = state.status === "signedOut" && state.denied;

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center font-display text-xl font-semibold text-brand-text">
          {association.shortName}
        </p>
        <div className="rounded-2xl border border-line bg-surface p-7">
          {stage === "sent" ? (
            <div role="status">
              <Icon name="mail" className="size-8 text-brand-text" />
              <h1 className="mt-3 font-display text-2xl font-semibold">Kolla din e-post</h1>
              <p className="mt-2 text-muted">
                Vi har skickat en inloggningslänk till <strong className="text-ink">{sentTo}</strong>.
                Kolla skräpposten om den inte dyker upp.
              </p>
              {devLink && (
                <a href={devLink} className="mt-4 inline-block font-semibold text-brand-text underline">
                  Öppna inloggningslänken (utvecklingsläge)
                </a>
              )}
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold">
                {stage === "confirm" ? "Bekräfta din e-post" : "Logga in i styrelseportalen"}
              </h1>
              <p className="mt-2 text-muted">
                {stage === "confirm"
                  ? "Skriv adressen som inloggningslänken skickades till."
                  : "Inget lösenord behövs. Vi mejlar en länk till dig."}
              </p>
              {(denied || error) && (
                <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error || "Den här adressen har inte tillgång till styrelseportalen."}
                </p>
              )}
              <form onSubmit={submit} className="mt-6 space-y-4">
                <Field label="E-postadress">
                  <input name="email" type="email" required autoComplete="email" className={inputClass} />
                </Field>
                <Button type="submit" icon="mail" disabled={busy} className="w-full">
                  {stage === "confirm" ? "Logga in" : busy ? "Skickar…" : "Skicka inloggningslänk"}
                </Button>
              </form>
            </>
          )}
        </div>
        <p className="mt-5 text-center text-sm">
          <Link to="/" className="underline">
            Tillbaka till webbplatsen
          </Link>
        </p>
      </div>
    </main>
  );
}
