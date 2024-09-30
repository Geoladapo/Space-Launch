import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { mongoConnect } from './services/mongo.js';
import { loadPlanetsData } from './models/planets.model.js';
import { loadLaunchData } from './models/launches.model.js';

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

startServer();
