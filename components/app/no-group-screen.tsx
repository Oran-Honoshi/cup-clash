// Shown on any app page when user has no group yet
export function NoGroupScreen({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="Cup Clash" className="h-20 w-20 rounded-3xl object-cover mx-auto" />
      <div>
        <h1 className="font-display text-3xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
          {name ? `Hi ${name}!` : "No group yet"}
        </h1>
        <p className="text-base" style={{ color: "#64748b" }}>
          You need to be in a group to access this page.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <a href="/create-group">
          <button className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Create a Group
          </button>
        </a>
        <a href="/join/enter">
          <button className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
            style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
            Join with Passkey
          </button>
        </a>
      </div>
    </div>
  );
}