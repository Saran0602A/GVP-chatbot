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

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.1)", // Slightly brighter glass
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    padding: "6px 12px",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    boxSizing: "border-box"
  };

  const inputStyle = {
    flex: 1,
    width: "100%", // Force stretch
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "1rem",
    padding: "12px 5px",
    // VISIBILITY FIXES
    color: "#ffffff", 
    WebkitTextFillColor: "#ffffff", // Prevents browser override
    caretColor: "#ffffff" // Makes the typing cursor white
  };

  const buttonStyle = {
    background: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 20px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: (disabled || !message.trim()) ? 0.5 : 1,
    whiteSpace: "nowrap",
    transition: "all 0.2s ease"
  };

  return (
    <div style={{ padding: "10px 20px", width: "100%", boxSizing: "border-box" }}> 
      <form style={containerStyle} onSubmit={submit}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Ask about admissions, placements..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
        <button 
          style={buttonStyle} 
          type="submit" 
          disabled={disabled || !message.trim()}
        >
          {disabled ? "..." : "Send ✨"}
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
