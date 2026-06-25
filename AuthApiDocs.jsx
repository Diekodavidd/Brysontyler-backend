import React from "react";

const AuthApiDocs = () => {
  const BASE_URL = "https://brysontyler-backend.onrender.com";

  const apis = [
    {
      method: "POST",
      endpoint: "/auth/register",
      description:
        "Creates a new user account (fan or creator). Returns JWT token and user data.",
    },
    {
      method: "POST",
      endpoint: "/auth/login",
      description:
        "Logs in a user using email and password. Returns JWT token and user data.",
    },
    {
      method: "GET",
      endpoint: "/auth/me",
      description:
        "Returns the currently authenticated user using JWT token (Bearer auth required).",
    },
    {
      method: "POST",
      endpoint: "/auth/forgot-password",
      description:
        "Sends a password reset email link using MailerSend.",
    },
    {
      method: "POST",
      endpoint: "/auth/reset-password/:token",
      description:
        "Resets user password using a valid reset token sent to email.",
    },
    {
      method: "POST",
      endpoint: "/auth/change-password",
      description:
        "Changes password for authenticated user after verifying current password.",
    },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Auth API Documentation</h1>
      <p style={styles.baseUrl}>
        Base URL: <code>{BASE_URL}</code>
      </p>

      <div style={styles.wrapper}>
        {apis.map((api, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.topRow}>
              <span
                style={{
                  ...styles.method,
                  background:
                    api.method === "POST" ? "#2ecc71" : "#3498db",
                }}
              >
                {api.method}
              </span>

              <span style={styles.endpoint}>
                {BASE_URL + api.endpoint}
              </span>
            </div>

            <p style={styles.description}>{api.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  baseUrl: {
    marginBottom: "30px",
    color: "#94a3b8",
  },
  wrapper: {
    display: "grid",
    gap: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
  },
  method: {
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#fff",
  },
  endpoint: {
    fontFamily: "monospace",
    color: "#38bdf8",
  },
  description: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.5",
  },
};

export default AuthApiDocs;