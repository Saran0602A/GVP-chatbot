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

  return (
    <form className="chat-input-wrap" onSubmit={submit}>
      <input
        className="chat-input"
        type="text"
        placeholder="Ask about admissions, placements, courses, or anything else..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
      />
      <button className="send-btn" type="submit" disabled={disabled || !message.trim()}>
        {disabled ? "Sending..." : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;
