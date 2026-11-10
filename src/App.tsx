import { Route, Routes } from "react-router";
import { PortalLayout } from "./layouts/PortalLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { HomePage } from "./pages/public/HomePage";
import { InfoPage } from "./pages/public/InfoPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { portalNav } from "./navigation";

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="nyheter" element={<PlaceholderPage title="Nyheter" />} />
        <Route path="nyheter/:id" element={<PlaceholderPage title="Nyhet" />} />
        <Route path="dokument" element={<PlaceholderPage title="Dokument" />} />
        <Route path="kontakt" element={<PlaceholderPage title="Kontakt" />} />
        <Route
          path="integritetspolicy"
          element={<PlaceholderPage title="Integritetspolicy" />}
        />
        <Route path=":slug" element={<InfoPage />} />
      </Route>

      <Route path="logga-in" element={<LoginPage />} />

      {/* Contains placeholders only. Phase 2 adds login and protected routes. */}
      <Route path="portal" element={<PortalLayout />}>
        {portalNav.map((item) =>
          item.to === "/portal" ? (
            <Route key={item.to} index element={<PlaceholderPage title={item.label} />} />
          ) : (
            <Route
              key={item.to}
              path={item.to.replace("/portal/", "")}
              element={<PlaceholderPage title={item.label} />}
            />
          ),
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
