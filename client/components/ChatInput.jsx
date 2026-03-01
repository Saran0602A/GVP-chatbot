import { useState } from "react";
import "./style.css";

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
    /* Updated class from chat-input-wrap to chat-input-container */
    <form className="chat-input-container" onSubmit={submit}>
      <input
        className="chat-input"
        type="text"
        placeholder="Ask about admissions, placements, courses..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        autoComplete="off"
      />
      {/* Updated class from send-btn to send-button */}
      <button 
        className="send-button" 
        type="submit" 
        disabled={disabled || !message.trim()}
      >
        {disabled ? (
          "Sending..."
        ) : (
          <>
            <span>Send</span>
            <span>✨</span>
          </>
        )}
      </button>
    </form>
  );
}

export default ChatInput;
