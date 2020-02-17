import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

import FileController from './app/controllers/FileController';
import DelivererController from './app/controllers/DelivererController';

import authMiddleware from './app/middleware/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.post('/recipient', RecipientController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliverer', DelivererController.store);
routes.get('/deliverer', DelivererController.index);
routes.put('/deliverer/:id', DelivererController.update);
routes.delete('/deliverer/:id', DelivererController.delete);

export default routes;
