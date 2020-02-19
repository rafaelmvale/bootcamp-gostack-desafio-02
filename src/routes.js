import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

import FileController from './app/controllers/FileController';
import SignatureController from './app/controllers/SignatureController';

import DelivererController from './app/controllers/DelivererController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveriesController from './app/controllers/DeliveriesController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middleware/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.post('/signatures', upload.single('file'), SignatureController.store);

routes.get('/deliveryman/:id/deliveries/:status', DeliveriesController.index);
routes.get('/deliveryman/:id/deliveries/', DeliveriesController.index);
routes.put(
  '/deliveryman/:id/deliveries/:delivery_id',
  DeliveriesController.update
);

routes.post('/delivery/:id/problems', DeliveryProblemController.store);

routes.use(authMiddleware);

routes.post('/recipient', RecipientController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/deliverer', DelivererController.index);
routes.post('/deliverer', DelivererController.store);
routes.put('/deliverer/:id', DelivererController.update);
routes.delete('/deliverer/:id', DelivererController.delete);

routes.get('/delivery', DeliveryController.index);
routes.post('/delivery', DeliveryController.store);
routes.put('/delivery/:id', DeliveryController.update);
routes.delete('/delivery/:id', DeliveryController.delete);

routes.get('/delivery/:id/problems', DeliveryProblemController.show);
routes.delete('/problem/:id/cancel-delivery', DeliveryProblemController.delete);
routes.get('/problems', DeliveryProblemController.index);
export default routes;
