import fs from "fs";
import { parse } from "csv-parse";

import planetModel from "./planets.mongo.js";

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

export function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream("data/kepler_data.csv")
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
}

export async function getAllPlanets() {
  return await planetModel.find({}, { "__v": 0, "_id": 0 });
}

async function savePlanet(planet) {
  try {
    await planetModel.updateOne(
      {
        keplerName: planet.keplerName,
      },
      {
        keplerName: planet.keplerName,
      },
      { upsert: true }
    );
  } catch (error) {
    console.error(`Could not save planet: ${error}`);
  }
}
