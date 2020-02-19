import * as Yup from 'yup';

import Recipient from '../models/Recipient';
import Deliverer from '../models/Deliverer';
import Delivery from '../models/Delivery';

import NewDelivery from '../jobs/NewDelivery';
import Queue from '../../lib/Queue';

class DeliveriesController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveries = await Delivery.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name_destinatario',
            'cep',
            'rua',
            'numero',
            'complemento',
            'estado',
            'cidade',
          ],
        },
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['id', 'name', 'emai'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, recipient_id, deliveryman_id, product } = await Delivery.create(
      req.body
    );

    const delivery = await Delivery.findByPk(id, {
      attributes: ['id', 'product', 'start_date', 'end_date', 'createdAt'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name_destinatario',
            'rua',
            'numero',
            'complemento',
            'estado',
            'cidade',
            'cep',
          ],
        },
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['id', 'name', 'emai'],
        },
      ],
    });
    await Queue.add(NewDelivery.key, { delivery });

    return res.json({ id, recipient_id, deliveryman_id, product });
  }

  async update(req, res) {
    // Fields validation
    const schema = Yup.object().shape({
      product: Yup.string(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      canceled_at: Yup.date(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation Fails.',
      });
    }

    const { id } = req.params;

    const deliveryExist = await Delivery.findByPk(id);

    if (!deliveryExist) {
      return res.status(400).json({
        error: 'Delivery does not exist.',
      });
    }

    const updatedDelivery = await deliveryExist.update(req.body);
    console.log(updatedDelivery);

    return res.json(updatedDelivery);
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'This delivery does not exists' });
    }

    delivery.destroy();
    return res.json({ msg: 'This delivery was deleted' });
  }
}

export default new DeliveriesController();
