const express = require("express");
const path = require("path");

const app = express();
const root = __dirname;
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

const staticOptions = {
  etag: true,
  maxAge: "1y",
  setHeaders(res, filePath) {
    if (path.extname(filePath).toLowerCase() === ".html") {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
};

app.get(["/home", "/home/", "/home/home", "/home/home/"], (_req, res) => {
  res.redirect(301, "/");
});

app.use(express.static(root, staticOptions));

app.get("/", (_req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

app.get("/:page", (req, res, next) => {
  const filePath = path.join(root, `${req.params.page}.html`);
  res.sendFile(filePath, err => {
    if (err) next();
  });
});

app.get("/:folder/:page", (req, res, next) => {
  const filePath = path.join(root, req.params.folder, `${req.params.page}.html`);
  res.sendFile(filePath, err => {
    if (err) next();
  });
});

app.use((_req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, host, () => {
  console.log(`OP Productions Express app running on ${host}:${port}`);
});
