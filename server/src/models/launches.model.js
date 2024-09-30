import axios from 'axios';

import launchesModel from './launches.mongo.js';
import planetModel from './planets.mongo.js';

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

export async function existLaunchWithId(launchId) {
  return await launchesModel.findOne({
    flightNumber: launchId,
  });
}

async function populateLaunches() {
  console.log('download launch data from space x');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };
    console.log(`${launch.flightNumber} - ${launch.mission}`);

    // TODO: populate launches collection
    await saveLaunch(launch);
  }
}

async function saveLaunch(launch) {
  await launchesModel.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesModel.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

export async function getAllLaunches(skip, limit) {
  return await launchesModel
    .find({}, { __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

export async function scheduleNewLaunch(launch) {
  const planet = await planetModel.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLauch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLauch);
}

export async function abortLaunchById(launchId) {
  const aborted = await launchesModel.updateOne(
    {
      flightNumber: launchId,
    },
    { upcoming: false, success: false }
  );

  console.log(aborted);

  return aborted.modifiedCount === 1;
}

export async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });
  if (firstLaunch) {
    console.log('Launch data already Loaded');
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesModel.findOne(filter);
}
