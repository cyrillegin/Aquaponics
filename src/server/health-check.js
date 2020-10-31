import 'regenerator-runtime/runtime';
import fetch from 'node-fetch';
import { Station, Sensor, Action } from './db';

const testSensor = (
  address,
  sensorId,
  stationId,
  hardwareName,
  hardwareType,
  readingType,
  pollRate,
) => {
  const kwargs = {
    sensorId,
    stationId,
    ip: process.env.IP,
    pollRate,
    hardwareName,
    hardwareType,
    readingType,
  };

  const kwargString = Object.entries(kwargs).reduce(
    (acc, [key, value]) => `${acc}&${key}=${value}`,
    '?',
  );

  console.log(kwargString);

  fetch(`http://${address}/sensorHealth${kwargString}`);
};

const runHealthCheck = async () => {
  const stations = await Station.findAll({
    include: [
      {
        model: Sensor,
        include: [Action],
      },
    ],
  });

  stations.forEach(station => {
    station.sensors.forEach(sensor => {
      // Skip fixture sensors
      if (sensor.dataValues.name.includes('FIXTURE')) {
        return;
      }
      // Skip self entry sensors
      if (sensor.hardwareName === 'self-entry') {
        return;
      }
      console.info(
        `sending check to ${sensor.hardwareName} - ${sensor.readingType} at station ${station.id}`,
      );

      let pollRate = 300;
      if (sensor.poll_rate) {
        const [, time, unit] = sensor.poll_rate.split(/(\d+)/);
        switch (unit) {
          case 's':
            pollRate = parseInt(time, 10);
            break;
          case 'm':
            pollRate = time * 60;
            break;
          case 'h':
            pollRate = time * 60 * 60;
            break;
          case 'd':
            pollRate = time * 60 * 60 * 24;
            break;
        }
      }

      testSensor(
        `${station.address}:${station.port}`,
        sensor.id,
        station.id,
        sensor.hardwareName,
        sensor.hardwareType,
        sensor.readingType,
        pollRate,
      );
    });
  });
};

setTimeout(() => {
  setInterval(() => {
    runHealthCheck();
  }, process.env.HEALTH_CHECK_INTERVAL * 1000);
}, 1000);
