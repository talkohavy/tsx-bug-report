import express from "express";
import { createHook } from "node:async_hooks";

async function initServer() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  const asyncHook = createHook({});

  asyncHook.enable(); // <--- Comment me out!

  app.use(express.json());

  app.get("/", async (req, res) => {
    await stepIntoMe();

    console.log("got here");

    res.json({ success: true });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

initServer();

async function stepIntoMe() {
  console.log("Attaching...");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Attached!");
}
