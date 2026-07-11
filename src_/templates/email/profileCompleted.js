const layout = require("./layout");

module.exports = (user) =>
  layout(
    "Profile Completed",

    `
      <p>Hi ${user.name},</p>

      <p>
        Your profile has been completed successfully.
      </p>

      <p>
        You're one step closer to becoming a creator.
      </p>

      <div style="margin-top:40px">
        <a
          href="${process.env.FRONTEND_URL}/ProfileImage"
          style="
            background:#d4af37;
            color:black;
            text-decoration:none;
            padding:15px 28px;
            border-radius:10px;
            font-weight:bold;
          "
        >
          Continue Setup
        </a>
      </div>
    `
  );