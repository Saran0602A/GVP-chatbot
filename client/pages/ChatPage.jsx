import { useEffect, useRef, useState } from "react";
import ChatBubble from "../components/ChatBubble.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";
import ChatInput from "../components/ChatInput.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const createMessage = (role, text) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  text
});

const appendAssistantToken = (list, token) => {
  const next = [...list];
  for (let i = next.length - 1; i >= 0; i -= 1) {
    if (next[i].role === "assistant") {
      next[i] = { ...next[i], text: `${next[i].text}${token}` };
      return next;
    }
  }
  next.push(createMessage("assistant", token));
  return next;
};

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const parseAndApplySse = (rawChunk, buffer, onToken, onError, onDone) => {
    const merged = `${buffer}${rawChunk}`;
    const frames = merged.split(/\r?\n\r?\n/);
    const nextBuffer = frames.pop() || "";

    frames.forEach((frame) => {
      const lines = frame.split(/\r?\n/);
      const eventLine = lines.find((line) => line.startsWith("event:"));
      const dataLine = lines.find((line) => line.startsWith("data:"));
      if (!eventLine || !dataLine) return;

      const event = eventLine.replace("event:", "").trim();
      let payload = {};
      try {
        payload = JSON.parse(dataLine.replace("data:", "").trim());
      } catch (_err) {
        return;
      }

      if (event === "token") onToken(payload.token || "");
      if (event === "error") onError(payload.error || "Streaming failed");
      if (event === "done") onDone();
    });

    return nextBuffer;
  };

  const sendMessage = async (text) => {
    setError("");
    setSending(true);
    setTyping(true);
    setMessages((prev) => [...prev, createMessage("user", text), createMessage("assistant", "")]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to connect to chatbot service.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      let streamFinished = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          const chunk = decoder.decode(result.value, { stream: true });
          buffer = parseAndApplySse(
            chunk,
            buffer,
            (token) => {
              setMessages((prev) => appendAssistantToken(prev, token));
            },
            (streamError) => {
              setError(streamError);
              streamFinished = true;
            },
            () => {
              streamFinished = true;
            }
          );
        }

        if (streamFinished) {
          await reader.cancel();
          break;
        }
      }
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setTyping(false);
      setSending(false);
    }
  };

  return (
    <main className="page">
      <section className="chat-shell">
        <header className="chat-header">
          <h1>Gayatri AI Assistant</h1>
          <p>Official AI Assistant of Gayatri Vidya Parishad College</p>
        </header>

        <section className="chat-body">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h2>Start a conversation</h2>
              <p>Ask about admissions, placements, courses, attendance, contact details, or general topics.</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatBubble key={message.id} role={message.role} text={message.text || " "} />
            ))
          )}

          {typing && <TypingIndicator />}

          {error ? <div className="error-box">{error}</div> : null}
          <div ref={bottomRef} />
        </section>

        <ChatInput onSend={sendMessage} disabled={sending} />
      </section>
    </main>
  );
}

export default ChatPage;
