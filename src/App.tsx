import { Route, Routes } from "react-router";
import { PortalLayout } from "./layouts/PortalLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DocumentsAdminPage } from "./pages/portal/DocumentsAdminPage";
import { ExportPage } from "./pages/portal/ExportPage";
import { MailingsPage } from "./pages/portal/MailingsPage";
import { MembersPage } from "./pages/portal/MembersPage";
import { NewsAdminPage } from "./pages/portal/NewsAdminPage";
import { NewsEditorPage } from "./pages/portal/NewsEditorPage";
import { OverviewPage } from "./pages/portal/OverviewPage";
import { PageEditorPage, PagesAdminPage } from "./pages/portal/PagesAdminPage";
import { SettingsPage } from "./pages/portal/SettingsPage";
import { YearWheelPage } from "./pages/portal/YearWheelPage";
import { ContactPage } from "./pages/public/ContactPage";
import { DocumentsPage } from "./pages/public/DocumentsPage";
import { HomePage } from "./pages/public/HomePage";
import { InfoPage } from "./pages/public/InfoPage";
import { NewsArticlePage, NewsListPage } from "./pages/public/NewsPages";
import { PrivacyPage } from "./pages/public/PrivacyPage";

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="nyheter" element={<NewsListPage />} />
        <Route path="nyheter/:id" element={<NewsArticlePage />} />
        <Route path="dokument" element={<DocumentsPage />} />
        <Route path="kontakt" element={<ContactPage />} />
        <Route path="integritetspolicy" element={<PrivacyPage />} />
        <Route path=":slug" element={<InfoPage />} />
      </Route>

      <Route path="logga-in" element={<LoginPage />} />

      {/* Uses fictional sample data only. Phase 2 adds login and protected routes. */}
      <Route path="portal" element={<PortalLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="nyheter" element={<NewsAdminPage />} />
        <Route path="nyheter/ny" element={<NewsEditorPage />} />
        <Route path="nyheter/:id" element={<NewsEditorPage />} />
        <Route path="utskick" element={<MailingsPage />} />
        <Route path="sidor" element={<PagesAdminPage />} />
        <Route path="sidor/:slug" element={<PageEditorPage />} />
        <Route path="dokument" element={<DocumentsAdminPage />} />
        <Route path="medlemmar" element={<MembersPage />} />
        <Route path="arshjul" element={<YearWheelPage />} />
        <Route path="installningar" element={<SettingsPage />} />
        <Route path="exportera" element={<ExportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
