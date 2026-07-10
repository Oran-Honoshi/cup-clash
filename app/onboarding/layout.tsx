export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/assets/images/stadium-bg-perspective.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 0 }} />
      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {children}
      </main>
    </div>
  );
}
