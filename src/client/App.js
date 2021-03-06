import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import Header from './components/Header';
import TreeView from './components/TreeView';
import Dashboard from './components/Dashboard';
import { windowEmitter, searchToObject } from './utilities/Window';
import Actions from './components/Actions';

const App = ({ className }) => {
  const [stations, setStations] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [, setDate] = useState(null);

  useEffect(() => {
    fetch('/api/station')
      .then(res => res.json())
      .then(res => {
        setStations(res);
      });

    fetch('/api/dashboard')
      .then(res => res.json())
      .then(res => {
        setDashboards(res);
      });

    windowEmitter.listen('station-refresh', () => {
      fetch('/api/station')
        .then(res => res.json())
        .then(res => {
          setStations(res);
        });
    });

    windowEmitter.listen('change', () => {
      setDate(new Date());
    });
  }, []);

  return (
    <div className={className}>
      <Header stations={stations} />
      {stations.length && (
        <div className="main-container">
          <TreeView stations={stations} dashboards={dashboards} />
          {'actions' in searchToObject() ? (
            <Actions stations={stations} />
          ) : (
            <Dashboard stations={stations} dashboards={dashboards} />
          )}
        </div>
      )}
    </div>
  );
};
App.propTypes = {
  className: PropTypes.string.isRequired,
};

const styledApp = styled(App)`
  margin: -8px;
  font-family: 'Muli', sans-serif;

  * {
    box-sizing: border-box;
  }

  .main-container {
    display: flex;
  }
`;

export default styledApp;
