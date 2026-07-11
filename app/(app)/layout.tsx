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
    <div className="relative flex overflow-hidden" style={{ height: "100dvh" }}>

      {/* ── Stadium background — theme-aware via .ta-stadium-bg (globals.css);
          each [data-theme] block swaps/removes the image and its overlay. ── */}
      <div
        className="ta-stadium-bg fixed inset-0 z-0"
        // `.ta-stadium-bg` sets `position: relative` in globals.css, declared
        // after Tailwind's utility layer — same specificity, later in the
        // cascade, so it silently wins over the `fixed` class here and
        // collapses this div to 0×viewport-height. Inline style beats any
        // class regardless of source order, so this is the only reliable fix.
        style={{ position: "fixed", transform: "translateZ(0)", willChange: "transform" }}
      />

      {/* ── App shell (sits above the background) ── */}
      <AppSidebar />
      <main className="relative z-10 flex-1 min-w-0 ltr:lg:ml-60 rtl:lg:mr-60 lg:pb-0 flex flex-col overflow-hidden app-safe-bottom">
        <AppInstallBanner />
        <AppHeader />
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden max-w-5xl w-full mx-auto px-4 sm:px-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <MobileNav />
      <JoinPromptModal />
    </div>
    </GroupProvider>
  );
}