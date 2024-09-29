import { getAllPlanets } from '../../models/planets.model.js';

export const httpGetAllPlanets = async (req, res) => {
  return res.status(200).json(await getAllPlanets());
};
