import express from "express";
import helmet from "helmet";
import cors from "cors";
import fs from "fs";
import { randomData, waitFor } from "./lib/randomData";
import dotenv from "dotenv";

dotenv.config();

const port = parseInt(process.env.PORT || "8080", 10);

const app = express();

app.use(helmet());
app.use(cors());

const data = fs.readFileSync("data.json", "utf-8");

app.get("/items", async (req, res) => {
  const json = JSON.parse(data);
  json.last_updated = Date.now();
  json.ttl = Math.floor(Math.random() * 41) + 20;

  const a = [null, undefined, {}];

  let page = req.query.page as string;

  if (!isNaN(page as any) && parseInt(page) > 0) {
    let page_size = 10;
    json.data.bikes = json.data.bikes.slice(
      (parseInt(page) - 1) * page_size,
      parseInt(page) * page_size
    );
  }

  for (let i = 0; i < json.data.bikes.length; i++) {
    if (Math.random() > 0.98) {
      json.data.bikes[i] = a[Math.floor(Math.random() * a.length)];
    } else {
      if (Math.random() > 0.9) {
        delete json.data.bikes[i].vehicle_type;
      }
    }
  }

  if (Math.random() > 0.95) await waitFor(5000);

  if (Math.random() > 0.95) {
    res.status(503);
    res.send("The server is not ready to handle the request.");
    return;
  }

  res.json(json);
});

app.get("/generate", (req, res) => {
  const json = randomData(500);
  res.json(json);
});

app.get("/items/:bike_id", (req, res) => {
  const json = JSON.parse(data);

  json.last_updated = Date.now();

  const bike = json.data.bikes.filter(
    (item: any) => item.bike_id === req.params.bike_id
  );

  delete json.data.bikes;

  json.data.bike = bike[0] || null;

  json.last_updated = Date.now();

  json.ttl = Math.floor(Math.random() * 41) + 20;

  res.json(json);
});

app.listen(port, () => {
  console.log("Api started");
});
