const http = require("node:http");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { z } = require("zod");

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",") }));
app.use(express.json({ limit: "256kb" }));
app.get("/health", (_request, response) => response.json({ status: "ok", service: "chat-service" }));
app.post("/api/v1/messages", (request, response) => {
  const parsed = z.object({ message: z.string().trim().min(1).max(4000) }).safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: "Invalid message" });
  return response.status(201).json({ id: crypto.randomUUID(), content: parsed.data.message });
});

const server = http.createServer(app);
server.listen(process.env.PORT || 3001, "0.0.0.0");

