// Each transport implements the same shape: async ({ to, subject, html }) => void
// Swapping providers later means adding a new transport here and changing
// EMAIL_PROVIDER — nothing calling sendEmail() needs to change.

async function consoleTransport({ to, subject, html }) {
  console.log("\n===== EMAIL (console transport — not actually sent) =====");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Body:\n", html);
  console.log("===========================================================\n");
}

// Placeholder for later — wire up when an ESP is chosen.
// async function resendTransport({ to, subject, html }) {
//   const { Resend } = require("resend");
//   const resend = new Resend(process.env.RESEND_API_KEY);
//   await resend.emails.send({ from: process.env.EMAIL_FROM, to, subject, html });
// }

const TRANSPORTS = {
  console: consoleTransport,
  // resend: resendTransport,
};

function getTransport() {
  const provider = process.env.EMAIL_PROVIDER || "console";
  const transport = TRANSPORTS[provider];
  if (!transport) {
    throw new Error(`Unknown EMAIL_PROVIDER "${provider}"`);
  }
  return transport;
}

module.exports = { getTransport };