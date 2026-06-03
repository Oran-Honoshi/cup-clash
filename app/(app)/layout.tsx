import { AppSidebar } from "@/components/app/sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { AppHeader } from "@/components/app/app-header";
import { PageTransition } from "@/components/app/page-transition";
import { AppInstallBanner } from "@/components/app/install-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex">{/* overflow-x-hidden temporarily removed */}

      {/* ── Stadium background ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/stadium-bg-perspective.png')" }}
      />
      {/* Darkening overlay so text stays readable */}
      <div className="fixed inset-0 z-0 bg-black/55" />

      {/* ── App shell (sits above the background) ── */}
      <AppSidebar />
      <main className="relative z-10 flex-1 lg:ml-60 pb-20 lg:pb-0 flex flex-col">
        <AppInstallBanner />
        <AppHeader />
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}