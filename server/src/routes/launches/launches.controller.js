import {
  abortLaunchById,
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
} from '../../models/launches.model.js';

export const httpGetAllLaunches = async (req, res) => {
  return res.status(200).json(await getAllLaunches());
};

export const httpAddNewLaunch = async (req, res) => {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({ error: 'Missing required launch property' });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (launch.launchDate.toString() === 'Invalid Date') {
    return res.status(400).json({ error: 'Invalid launch date' });
  }

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
};

export const httpAbortLaunch = async (req, res) => {
  const launchId = Number(req.params.id);

  const existLaunch = await existLaunchWithId(launchId);

  if (!existLaunch) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }

  const aborted = await abortLaunchById(launchId);

  if (!aborted) {
    return res.status(400).json({ error: 'Launch not aborted' });
  }
  return res.status(200).json({ ok: true });
};
