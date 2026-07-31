const steps = [
  {
    number: '01',
    title: 'Connect Your Wallet',
    text: 'Link your Midnight wallet — the entry point to the shielded execution layer. No personal data collected.',
  },
  {
    number: '02',
    title: 'Submit Locally',
    text: 'Enter your private witness. The ZK circuit executes in your browser, generating a proof — your identity stays local.',
  },
  {
    number: '03',
    title: 'Verify On-Chain',
    text: 'Only the text and the mathematical proof are disclosed to the public ledger. Anyone can verify without knowing who you are.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-[1] mx-auto w-full max-w-[1280px] px-6 py-20 md:py-[100px]">
      <div className="mb-[60px] text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-dim px-3.5 py-1.5 text-[11px] font-medium tracking-[0.5px] text-accent uppercase backdrop-blur">
          How It Works
        </div>
        <h2 className="mb-3 text-[28px] font-bold tracking-[-1px] md:text-[40px]">Three Steps to Speak Freely</h2>
        <p className="mx-auto max-w-[560px] text-base leading-[1.7] text-muted-foreground">
          From wallet connection to on-chain proof — complete in seconds, private forever.
        </p>
      </div>
      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="absolute top-12 right-[15%] left-[15%] hidden h-px bg-gradient-to-r from-transparent via-hover-bg to-transparent md:block" />
        {steps.map((s, i) => (
          <div key={i} className="relative z-[1] flex flex-col items-center text-center">
            <div className="mb-6 flex size-24 items-center justify-center rounded-full border border-border bg-bg font-mono text-[28px] font-bold text-accent shadow-[var(--shadow-strong)]">
              {s.number}
            </div>
            <h3 className="mb-3 text-lg font-semibold">{s.title}</h3>
            <p className="max-w-[280px] text-sm leading-[1.7] text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
