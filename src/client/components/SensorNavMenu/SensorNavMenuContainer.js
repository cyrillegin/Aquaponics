import {compose, mapProps} from 'recompose';
import SensorNavMenu from './SensorNavMenu';

export default compose(
  mapProps((ownProps) => {
    return {
      ...ownProps,
      getTree: () => {
        return new Promise((res, rej) => {
          fetch('/api/sensor')
            .then(response => response.json())
            .then((data) => {
              const tree = {};
              data.forEach((sensor) => {
                if (sensor.station !== undefined) {
                  if (!(sensor.station in tree)) {
                    tree[sensor.station] = [];
                  }
                  tree[sensor.station].push({
                    name: sensor.name || 'nameless',
                    uuid: sensor.uuid,
                    status: sensor.status,
                    poller: sensor.poller,
                  });
                } else {
                  if (!('stationless' in tree)) {
                    tree.stationless = [];
                  }
                  tree.stationless.push({
                    name: sensor.name || 'nameless',
                    uuid: sensor.uuid,
                    status: sensor.status,
                  });
                }
              });

              res({
                sensors: tree,
                loading: false,
              });
            })
            .catch((error) => {
              console.log('got error');
              console.log(error);
              rej(error);
            });
        });
      },
    };
  }),
)(SensorNavMenu);