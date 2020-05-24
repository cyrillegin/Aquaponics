import { Router } from 'express';

const router = new Router();

router.post('/', async (req, res) => {
  console.info('post sensor');
  res.sendStatus(200);
});

router.put('/', async (req, res) => {
  console.info('put sensor');
  res.sendStatus(200);
});

router.delete('/', async (req, res) => {
  console.info('delete sensor');
  res.sendStatus(200);
});

export default router;
