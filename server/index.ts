import express from "express";
import helmet from "helmet";
import cors from "cors";
import fs from "fs";
import { randomData, waitFor } from "./lib/randomData";
import dotenv from "dotenv";
import Joi from "joi";
import randomstring from "randomstring";
import bodyParser from "body-parser";

dotenv.config();

const port = parseInt(process.env.PORT || "8080", 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.get("/items", async (req, res) => {
  try {
    const json = JSON.parse(fs.readFileSync("data.json", "utf-8"));
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
      json.nextPage = json.data.bikes.length > parseInt(page) * page_size;
    }

    for (let i = 0; i < json.data.bikes.length; i++) {
      if (Math.random() > 0.995) {
        json.data.bikes[i] = a[Math.floor(Math.random() * a.length)];
      } else {
        if (Math.random() > 0.9) {
          if (json.data.bikes[i].vehicle_type)
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
  } catch (error) {
    res.status(500);
    res.send("Ops :/");
  }
});

app.get("/generate", (req, res) => {
  if (process.env.NODE_ENV === "production") return res.send("ok");
  const json = randomData(500);
  res.json(json);
});

app.post("/item", async (req, res) => {
  const input = req.body;

  const { error, value } = await Joi.object({
    is_disabled: Joi.number().allow(1, 0).default(0),
    is_reserved: Joi.number().allow(1, 0).default(0),
    vehicle_type: Joi.string().required().valid("scooter", "bike"),
    total_bookings: Joi.number().min(0).default(0),
    lat: Joi.number(),
    lon: Joi.number(),
  }).validate(input);

  if (error) {
    res.status(400);
    res.json({ success: false, message: error.details[0].message });
    return;
  }

  const data = {
    bike_id: randomstring.generate({ length: 5, capitalization: "uppercase" }),
    ...input,
  };

  res.json({ success: true, data });
});

app.get("/items/:bike_id", (req, res) => {
  const json = JSON.parse(fs.readFileSync("data.json", "utf-8"));

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
