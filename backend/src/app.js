const express = require("express");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

const PUBLIC_DIR = path.resolve(__dirname, "../public");

app.use(cors());
app.use(express.json());
app.use(
  "/public",
  express.static(PUBLIC_DIR, {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Disposition", "attachment");
      }
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

app.use("/api/v1", routes);

app.get("/", (req, res, next) => {
  res.json({
    message: "API AmigojoLive funcionando correctamente",
  });
  next();
});

app.use(errorMiddleware);

module.exports = app;