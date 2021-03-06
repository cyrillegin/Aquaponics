import './env';
import 'regenerator-runtime/runtime';
import path from 'path';
import { fork } from 'child_process';
import fetch from 'node-fetch';
// import expressStaticGzip from 'express-static-gzip';
import express from 'express';
import bodyParser from 'body-parser';
import api from './api';
import { setupDb } from './db';

const app = express();

setupDb();

// app.use('/', expressStaticGzip(path.join(__dirname, '/public/')));

app.use(express.static(path.join(__dirname, '/public/')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/health', (req, res) => res.sendStatus(200));

app.get('/list', (req, res) => {
  fetch(`http://${req.query.ip}/list`)
    .then(response => response.json())
    .then(response => res.send(response));
});

app.use(express.json({ type: ['application/*+json', 'application/json'] }));
app.use(api);

fork('./dist/health-check.js');
fork('./dist/actions/actions.js');

app.listen(process.env.SERVER_PORT, () => {
  console.info(`App started on port ${process.env.SERVER_PORT}`);
});
