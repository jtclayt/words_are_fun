import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 5000;

// Maybe get a database or something
const words = ["about", "crude", "crush", "dates", "words", "hello", "fresh", "anger"];

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
})

app.get("/word", (_, res) => {
  const randomIndex = Math.floor(Math.random() * words.length);
  res.status(200).send({word: words[randomIndex]});
})

app.listen(port, () => console.log(`Running on port ${port}`));
