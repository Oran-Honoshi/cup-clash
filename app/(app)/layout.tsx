import { AppSidebar } from "@/components/app/sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { AppHeader } from "@/components/app/app-header";
import { PageTransition } from "@/components/app/page-transition";
import { AppInstallBanner } from "@/components/app/install-banner";
import { JoinPromptModal } from "@/components/join/join-prompt-modal";
import { GroupProvider } from "@/lib/contexts/group-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroupProvider>
    <div className="relative min-h-screen flex overflow-x-clip">

      {/* ── Stadium background ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/stadium-bg-perspective.png')", transform: "translateZ(0)", willChange: "transform" }}
      />
      {/* Darkening overlay so text stays readable */}
      <div className="fixed inset-0 z-0 bg-black/55" style={{ transform: "translateZ(0)" }} />

      {/* ── App shell (sits above the background) ── */}
      <AppSidebar />
      <main className="relative z-10 flex-1 min-w-0 ltr:lg:ml-60 rtl:lg:mr-60 lg:pb-0 flex flex-col app-safe-bottom">
        <AppInstallBanner />
        <AppHeader />
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <MobileNav />
      <JoinPromptModal />
    </div>
    </GroupProvider>
  );
}