import { useState } from "react";

function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage("");
  };

  // Inline styles to guarantee the look
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "8px 12px",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto"
  };

  const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
    padding: "10px"
  };

  const buttonStyle = {
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "10px 20px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1
  };

  return (
    <div style={{ padding: "20px", width: "100%" }}> 
      <form style={containerStyle} onSubmit={submit}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Ask about admissions, placements..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
        />
        <button style={buttonStyle} type="submit" disabled={disabled || !message.trim()}>
          {disabled ? "..." : "Send ✨"}
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
