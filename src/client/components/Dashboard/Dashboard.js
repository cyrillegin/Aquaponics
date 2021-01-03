import React, { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import Graph from '../../charts/Graph';
import { windowEmitter, searchToObject } from '../../utilities/Window';
import SensorDetails from '../SensorDetails';
import Store from '../../utilities/Store';

const Dashboard = ({ className, stations, dashboards }) => {
  const [currentStations, changeStations] = useState([]);
  const [currentSensor, changeSensor] = useState({});
  const [currentDashboard, changeDashboard] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  const setStations = useCallback(() => {
    const { station, sensor, dashboard } = searchToObject();
    if (station) {
      const stationId = parseInt(station, 10);
      const currentStation = stations.filter(sta => sta.id === stationId)[0];
      changeStations([currentStation]);
      changeSensor({});
      changeDashboard({});
    } else if (sensor) {
      const sensorId = parseInt(sensor, 10);
      const currentStation = stations.find(sta => sta.sensors.find(sen => sen.id === sensorId));
      changeStations([currentStation]);
      const curSensor = currentStation.sensors.find(sen => sen.id === sensorId);
      changeSensor(curSensor);
      changeDashboard({});
    } else if (dashboard) {
      changeDashboard(dashboards.find(dash => dash.dashboardId === dashboard));
      changeSensor({});
      changeStations([]);
    } else {
      changeStations(stations);
    }
  }, [dashboards, stations]);

  useEffect(() => {
    setStations();
    windowEmitter.listen('change', () => {
      setStations();
    });
  }, [setStations]);

  useEffect(() => {
    Store.listen('collapse', () => {
      setCollapsed(!collapsed);
    });
  }, [collapsed]);

  return (
    <div className={`${className} ${collapsed ? 'collapse' : ''}`}>
      {currentSensor.id && (
        <div className="sensor tall">
          <Graph name={currentStations[0].name} sensor={currentSensor} renderTrigger={new Date()} />
          <SensorDetails sensor={currentSensor} />
        </div>
      )}

      {!currentSensor.id && currentStations.length && (
        <>
          {currentStations.map(station => (
            <div className="station" key={station.id}>
              {station.sensors.map(sensor => (
                <div className="sensor" key={sensor.id}>
                  <Graph name={station.name} sensor={sensor} renderTrigger={new Date()} />
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {currentDashboard.sensors && (
        <div className="station">
          {currentDashboard.sensors.map(sensor => (
            <div className="sensor" key={sensor.id}>
              <Graph name={currentDashboard.name} sensor={sensor} renderTrigger={new Date()} />
            </div>
          ))}
        </div>
      )}

      {!currentDashboard.sensors && !currentSensor.id && !currentStations.length && <>Loading...</>}
    </div>
  );
};

Dashboard.propTypes = {
  className: PropTypes.string.isRequired,
  stations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      health: PropTypes.oneOf(['healthy', 'unhealthy']),
      sensors: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          health: PropTypes.oneOf(['healthy', 'unhealthy']),
        }),
      ),
    }),
  ).isRequired,
  dashboards: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      sensors: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          stationId: PropTypes.number.isRequired,
          position: PropTypes.number.isRequired,
        }),
      ),
    }),
  ).isRequired,
};

const styledDashboard = styled(Dashboard)`
  position: absolute;
  left: 400px;
  background: white;
  width: calc(100% - 408px);
  margin-top: 5rem;
  margin-left: 8px;
  transition: 0.6s;

  &.collapse {
    transform: translateX(-380px);
    width: calc(100% - 28px);
  }

  .station {
    width: 100%;
    background: white;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    margin: 2rem 0;
  }

  .sensor {
    width: 100%;
    height: 300px;

    &.tall {
      height: 600px;
    }
  }
`;

export default styledDashboard;
