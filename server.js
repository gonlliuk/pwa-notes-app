const express = require("express");
const {json, urlencoded} = require("body-parser");
const path = require("path");
const PORT = process.env.PORT || 3000;

let idCounter = 0;
let notes = [
  {
    id: (++idCounter).toString(),
    title: "First Note",
    text: "Do some things",
  },
  {
    id: (++idCounter).toString(),
    title: "Second Note",
    text: "After that do another things",
  },
];

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.render(path.join(__dirname, "/public/index.html"));
});

const api = express.Router();

api.get("/notes", (req, res) => {
  res.json(notes);
});

api.post("/notes", (req, res) => {
  const note = {
    id: (++idCounter).toString(),
    title: req.body.title,
    text: req.body.text,
  };
  notes.push(note);
  res.json(note);
});

api.patch("/notes/:id", (req, res) => {
  const id = req.params.id;
  const note = notes.find((note) => note.id === id);
  if (!note) {
    res.status(404).send(`Note with id '${id}' not found`);
  }
  note.title = req.body.title || note.title;
  note.text = req.body.text || note.text;
  res.json(note);
});

api.delete("/notes/:id", (req, res) => {
  const id = req.params.id;
  notes = notes.filter((note) => note.id !== id);
  res.send(true);
});

app.use("/api", api);

app.listen(PORT, (e) => {
  if (e) throw e;
  console.log("Server is listening on port " + PORT);
});
