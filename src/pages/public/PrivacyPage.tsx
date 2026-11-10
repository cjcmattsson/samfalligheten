import { Prose } from "../../components/ui";
import { useStore } from "../../demo/store";

export function PrivacyPage() {
  const { association } = useStore();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight">Integritetspolicy</h1>
      <Prose
        body={`Utkast. Den slutliga texten ska granskas av styrelsen innan webbplatsen tas i bruk.

## Vilka uppgifter vi behandlar

Föreningen för ett medlemsregister med namn, fastighet, adress, e-post och eventuellt telefonnummer. Registret är bara tillgängligt för styrelsen.

## Varför vi behandlar dem

Uppgifterna behövs för att förvalta samfälligheten, kalla till stämma och informera medlemmarna.

## Besöksstatistik och kakor

Webbplatsen använder inga spårningsverktyg och ingen besöksstatistik.

## Dina rättigheter

Du kan begära att få se, rätta eller radera dina uppgifter genom att mejla ${association.email}. Varje utskick innehåller en länk för att avregistrera sig.`}
      />
    </article>
  );
}
