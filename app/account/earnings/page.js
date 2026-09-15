export const metadata = { title: 'Earnings | ReggaeAI', robots: { index: false, follow: false } };

export default function EarningsPage() {
  return (
    <main className="accountShell">
      <section className="accountHero compact">
        <span className="eyebrow">CREATOR EARNINGS</span>
        <h1>Simple USD accounting.</h1>
        <p>Balances settle on a monthly cycle. The minimum payout is US$25; smaller balances roll forward automatically.</p>
      </section>

      <section className="balanceGrid">
        <article><span>Available</span><strong>US$0.00</strong><small>Eligible for next payout once verified and above threshold.</small></article>
        <article><span>Pending</span><strong>US$0.00</strong><small>Sales still inside the settlement window.</small></article>
        <article><span>Lifetime</span><strong>US$0.00</strong><small>Confirmed creator accruals.</small></article>
      </section>

      <section className="payoutPolicy">
        <div><span className="eyebrow">PAYOUT POLICY</span><h2>Monthly. USD. Minimum US$25.</h2></div>
        <p>No payout is marked paid until the payout provider confirms settlement. Refunds, chargebacks and processor fees are reflected before creator payable balances are released.</p>
      </section>
    </main>
  );
}
