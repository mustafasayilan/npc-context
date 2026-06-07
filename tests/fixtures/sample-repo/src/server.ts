import express from "express";
import { getSettings, updateSettings } from "./settings";
import { loginUser } from "./auth";

export function createServer() {
  const app = express();
  app.use(express.json());

  app.post("/api/login", async (request, response) => {
    const result = await loginUser(request.body.email, request.body.password);
    response.json(result);
  });

  app.get("/api/settings", async (_request, response) => {
    response.json(await getSettings());
  });

  app.patch("/api/settings", async (request, response) => {
    response.json(await updateSettings(request.body));
  });

  return app;
}
