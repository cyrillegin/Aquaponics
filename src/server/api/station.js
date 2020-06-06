import { Router } from 'express';
import Sequelize from 'sequelize';
import isIP from '../validators';
import { Station, Sensor, Action, Reading } from '../db';

const router = new Router();

/**
 * GET
 * Gets an array of all the stations and their sensors
 *
 * kwargs: none
 *
 * returns {
 *   stations: [{
 *     name: 'station name',
 *     ipAdress: '123.123.123.123',
 *     sensors: [{
 *       name: 'sensor name',
 *       id: 1,
 *       description: 'A sensor',
 *       health: 'healthy',
 *       state: 'on, off, null',
 *       coefficients: '9/5, 32',
 *       type: 'temperature',
 *       actions: [{
 *         condition: 'condition',
 *         action: 'action',
 *         interval: '5h'
 *       }],
 *     }]
 *   }]
 * }
 */
router.get('/', async (req, res) => {
  console.info('GET request to station');
  const stations = await Station.findAll({
    include: [
      {
        model: Sensor,
      },
    ],
  });
  res.send(stations);
});

/**
 * POST
 * Creates a new station
 *
 * params: {
 *   name: 'station name',
 *   ip: 'xxx.xxx.xxx.xxx'
 * }
 *
 * returns: 200 success, 400 if validation fails
 */
router.post('/', async (req, res) => {
  console.info('POST request to station');
  const { name, ip } = req.body;

  const valid = validateStationParams(req.body);
  if (valid.error) {
    res.status(400).send({ error: valid.error });
    return;
  }

  try {
    const result = await Station.create({ name, ip });
    console.info('new station added');
    res.status(200).send({ message: 'success' });
  } catch (e) {
    console.error('an error occured!');
    console.error(e);
    res.status(400).send({ error: 'An unknown error has occured' });
  }
});

/**
 * PUT
 * Updates an existing station
 *
 * params:  {
 *   name: 'station name',
 *   ip: 'xxx.xxx.xxx.xxx'
 * }
 *
 * returns: 200 success, 400 if validation fails
 */
router.put('/', async (req, res) => {
  console.info('PUT request to station');
  const valid = validateStationParams(req.body);
  if (valid.error) {
    res.status(400).send({ error: valid.error });
    return;
  }
  try {
    const result = await Station.update(
      {
        name: req.body.name,
        ip: req.body.ip,
      },
      {
        where: { id: req.body.id },
      },
    );
    console.info('station updated');
    res.status(200).send({ message: 'success' });
  } catch (e) {
    console.error('an error occured!');
    console.error(e);
    res.status(400).send({ error: 'An unknown error has occured' });
  }
});

/**
 * DELETE
 * Deletes an existing station and all of its readings, actions, and sensors
 *
 * kwargs: id=stationId (int)
 *
 * returns: 200 - success and the number of actions, readings, sensors, and stations deleted
 *          400 if id doesn't exist
 */
router.delete('/', async (req, res) => {
  console.info('DELETE request to station');
  if (!req.query.id) {
    res
      .status(400)
      .send({ error: 'You must provide the id of the station you would like to delete' });
    return;
  }
  try {
    const actions = await Action.destroy({
      where: { stationId: req.query.id },
    });

    const readings = await Reading.destroy({
      where: { stationId: req.query.id },
    });

    const sensors = await Sensor.destroy({
      where: { stationId: req.query.id },
    });

    const stations = await Station.destroy({
      where: { id: req.query.id },
    });

    res.status(200).send({ message: 'success', actions, sensors, stations, readings });
  } catch (e) {
    console.error('an error occured!');
    console.error(e);
    res.status(400).send({ error: 'An unknown error has occured' });
  }
});

const validateStationParams = params => {
  if (!params.name) {
    return { error: 'Station name required' };
  }
  if (!params.ip) {
    return { error: 'Station ip required' };
  }
  if (!isIP(params.ip)) {
    return { error: 'IP Address must be valid' };
  }
  return {};
};

export default router;
