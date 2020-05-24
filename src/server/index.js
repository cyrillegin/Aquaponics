import './env'
import 'regenerator-runtime/runtime';
import path from 'path';
import express from 'express';
import api from './api';
import './db';

const app = express();

app.use(express.static(path.join(__dirname, '/public/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});
app.get('/health', (req, res) => res.sendStatus(200));

app.use(express.json());

app.use(api);

app.listen(3000, () => {
  console.info(`App started on port ${3000}`);
});