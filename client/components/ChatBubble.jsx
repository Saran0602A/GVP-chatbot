function ChatBubble({ role, text }) {
  return (
    <div className={`bubble-row ${role === "user" ? "user-row" : "assistant-row"}`}>
      <div className={`bubble ${role === "user" ? "user-bubble" : "assistant-bubble"}`}>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default ChatBubble;
