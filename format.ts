export function format(tx: any): string {
  const { blockTime, slot, meta, transaction } = tx;

  const date = blockTime
    ? new Date(blockTime * 1000).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : "N/A";

  const status = meta.err ? "❌ Failed" : "✅ Success";

  const feeSol = meta.fee / 1_000_000_000;

  const pre = meta.preBalances[0] ?? 0;
  const post = meta.postBalances[0] ?? 0;
  const diffSol = (post - pre) / 1_000_000_000;

  const direction =
    diffSol > 0 ? "⬆️ Received" : diffSol < 0 ? "⬇️ Sent" : "↔️ No Change";

  return [
    `${status}`,
    `🕒 Time: ${date}`,
    `📦 Slot: ${slot}`,
    `💸 Fee: ${feeSol} SOL`,
    `${direction}: ${diffSol} SOL`,
  ].join("\n");
}
