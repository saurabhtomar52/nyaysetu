import cors from "cors";
import express from "express";
import helmet from "helmet";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(",");

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "256kb" }));

const messageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000),
});

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "chat-api" });
});

app.post("/api/v1/conversations/messages", (request, response) => {
  const parsed = messageSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid message", details: parsed.error.flatten() });
    return;
  }
  const conversationId = parsed.data.conversationId ?? crypto.randomUUID();
  response.status(201).json({
    conversationId,
    message: {
      id: crypto.randomUUID(),
      role: "user",
      content: parsed.data.message,
      createdAt: new Date().toISOString(),
    },
  });
});

app.use((_request, response) => response.status(404).json({ error: "Route not found" }));
app.listen(port, "0.0.0.0", () => console.log(`chat-api listening on ${port}`));

