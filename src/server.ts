import dotenv from "dotenv";
import express from "express";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), 'env/.env')});

import { App } from "./app";
import { setup } from "./config/setup";

const port: number = Number(process.env.PORT) || 5000;

try {
  setup();
  App.instance.use("/public", express.static(path.join(__dirname, "../public")));

  App.instance.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
  });
} catch (error) {
  console.log(`Startup error: ${error}`);
}

App.instance.use("/public", express.static(path.join(__dirname, "public")));

App.instance.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

App.instance.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
