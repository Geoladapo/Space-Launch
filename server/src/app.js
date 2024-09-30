import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// import { api } from './routes/api.js';

import planetsRouter from './routes/planets/planets.router.js';
import launchesRouter from './routes/launches/launches.router.js';

export const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

app.use('/v1/planets', planetsRouter);
app.use('/v1/launches', launchesRouter);

// api.use('/v1', api);

app.get('/*', (req, res) => {
  res.send('public/index.html');
});
