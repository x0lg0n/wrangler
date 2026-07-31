const features = [
  {
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    title: 'Zero-Knowledge Privacy',
    text: 'Your identity is cryptographically shielded. The network verifies your submission without ever seeing who you are.',
  },
  {
    icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    title: 'On-Chain Verification',
    text: 'Every submission is recorded on the Midnight ledger. Anyone can verify the ZK proof — no trusted third party required.',
  },
  {
    icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    title: 'No Identity Required',
    text: 'No email, no username, no KYC. Your Midnight wallet is all you need to submit verified feedback instantly.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative z-[1] mx-auto w-full max-w-[1280px] px-6 py-20 md:py-[100px]">
      <div className="mb-[60px] text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-dim px-3.5 py-1.5 text-[11px] font-medium tracking-[0.5px] text-accent uppercase backdrop-blur">
          Why Wrangler
        </div>
        <h2 className="mb-3 text-[28px] font-bold tracking-[-1px] md:text-[40px]">Privacy-First Architecture</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((f, i) => (
          <div key={i} className="group rounded-2xl border border-border bg-elevated p-8 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-border">
            <div className="mb-6 flex size-12 items-center justify-center rounded-[10px] border border-border bg-bg text-accent transition-colors duration-300 group-hover:border-accent-border">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </div>
            <h3 className="mb-3 text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-[1.7] text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
