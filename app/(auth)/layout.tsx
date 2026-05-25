export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundImage: "url('/assets/images/stadium-bg-perspective.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 0 }} />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {children}
      </div>
    </div>
  );
}
