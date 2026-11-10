import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Icon } from "../components/icons";
import { Button, Field, LinkButton, inputClass } from "../components/ui";
import { useStore } from "../demo/store";

export function LoginPage() {
  const { association } = useStore();
  const [sentTo, setSentTo] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSentTo(String(new FormData(event.currentTarget).get("email")));
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center font-display text-xl font-semibold text-brand-text">
          {association.shortName}
        </p>
        <div className="rounded-2xl border border-line bg-surface p-7">
          {sentTo ? (
            <div role="status">
              <Icon name="mail" className="size-8 text-brand-text" />
              <h1 className="mt-3 font-display text-2xl font-semibold">Kolla din e-post</h1>
              <p className="mt-2 text-muted">
                Om <strong className="text-ink">{sentTo}</strong> tillhör styrelsen får du strax en
                inloggningslänk.
              </p>
              <div className="mt-6">
                <LinkButton to="/portal">Öppna förhandsversionen</LinkButton>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold">Logga in i styrelseportalen</h1>
              <p className="mt-2 text-muted">Inget lösenord behövs. Vi mejlar en länk till dig.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <Field label="E-postadress">
                  <input name="email" type="email" required autoComplete="email" className={inputClass} />
                </Field>
                <Button type="submit" icon="mail" className="w-full">
                  Skicka inloggningslänk
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
