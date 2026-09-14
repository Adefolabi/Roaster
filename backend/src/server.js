const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Routes
const roastRouter = require("./routes/roast");
const shareCardRouter = require("./routes/shareCard");
const healthRouter = require("./routes/health");

app.use(cors());
app.use(express.json());

// Serve meme sticker assets statically
app.use("/assets/stickers", express.static(path.join(__dirname, "assets", "stickers")));

app.use("/api/roast", roastRouter);
app.use("/api/share-card", shareCardRouter);
app.use("/api/health", healthRouter);

app.listen(PORT, () => console.log(`App listening on ${PORT}`));
