import express from "express";
import { streamAssistantResponse } from "../services/llm.js";

const router = express.Router();

const writeSse = (res, type, payload) => {
  res.write(`event: ${type}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  if (typeof res.flush === "function") {
    res.flush();
  }
};

router.post("/", async (req, res) => {
  const message = req.body?.message;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let clientDisconnected = false;
  req.on("aborted", () => {
    clientDisconnected = true;
  });
  res.on("close", () => {
    clientDisconnected = true;
  });

  try {
    await streamAssistantResponse({
      message: message.trim(),
      onToken: (token) => {
        if (!clientDisconnected && !res.writableEnded) {
          writeSse(res, "token", { token });
        }
      }
    });

    if (!clientDisconnected && !res.writableEnded) {
      writeSse(res, "done", { ok: true });
      res.end();
    }
  } catch (error) {
    console.error("Chat route error:", error);

    if (!clientDisconnected && !res.writableEnded) {
      writeSse(res, "error", { error: "Failed to generate response." });
      res.end();
    }
  }
});

export default router;
