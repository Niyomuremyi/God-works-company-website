const APP_NAME = "God Works Company";

function passwordResetEmail({ name, resetUrl }) {
  return {
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to reset your ${APP_NAME} password. Click the button below to choose a new one. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#18181b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#71717a;font-size:12px;">${resetUrl}</p>
      </div>
    `,
  };
}

module.exports = { passwordResetEmail };