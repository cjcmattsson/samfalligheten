import { useParams } from "react-router";
import { infoPages } from "../../navigation";
import { NotFoundPage } from "../NotFoundPage";
import { PlaceholderPage } from "../PlaceholderPage";

export function InfoPage() {
  const { slug } = useParams();
  const page = infoPages.find((candidate) => candidate.slug === slug);

  if (!page) {
    return <NotFoundPage />;
  }

  return <PlaceholderPage title={page.label} />;
}
