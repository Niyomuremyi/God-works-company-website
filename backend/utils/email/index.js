const { getTransport } = require("./transports");

async function sendEmail({ to, subject, html }) {
  const transport = getTransport();
  await transport({ to, subject, html });
}

module.exports = { sendEmail };