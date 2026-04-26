import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Back to home */}
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Decorative corner glows */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--brand) / 0.12), transparent 70%)",
          transform: "translate(-30%, -30%)",
        }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--brand-2) / 0.08), transparent 70%)",
          transform: "translate(30%, 30%)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
