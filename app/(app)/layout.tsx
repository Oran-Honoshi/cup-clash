import { AppSidebar } from "@/components/app/sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { AppHeader } from "@/components/app/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0 flex flex-col">
        {/* Mobile top header with notification bell */}
        <AppHeader />
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
