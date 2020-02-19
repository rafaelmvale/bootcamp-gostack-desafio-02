import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliverer from '../models/Deliverer';

import NewDeliveryCancellation from '../jobs/NewDeliveryCancellation';

import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveryWithProblems = await Delivery.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: DeliveryProblem,
          as: 'problems',
          required: true,
          attributes: ['id', 'description'],
        },
      ],
    });

    return res.json(deliveryWithProblems);
  }

  async show(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'This delivery does not exists' });
    }
    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'description'],
      where: {
        delivery_id: delivery.id,
      },
    });

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'This delivery does not exists' });
    }

    if (!req.body.description) {
      return res
        .status(401)
        .json({ error: 'Description is required and cannot be empty' });
    }

    const problem = await DeliveryProblem.create({
      description: req.body.description,
      delivery_id: delivery.id,
    });

    return res.json({
      msg: `The problem: ${problem.description}, was added to delivery: ${delivery.id}`,
    });
  }

  async delete(req, res) {
    const deliveryProblem = await DeliveryProblem.findByPk(req.params.id);

    if (!deliveryProblem) {
      return res.status(401).json({ error: 'This problem does not exists' });
    }
    const delivery = await Delivery.findByPk(deliveryProblem.delivery_id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name_destinatario'],
        },
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['id', 'name', 'emai'],
        },
      ],
    });

    if (!delivery) {
      return res.status(401).json({ error: 'This delivery does not exists' });
    }

    if (delivery.canceled_at !== null) {
      return res.status(401).json({ error: 'delivery was already cancelled' });
    }

    const mailData = {
      delivery,
      problem: deliveryProblem.description,
    };

    await Queue.add(NewDeliveryCancellation.key, { mailData });

    await delivery.update({ canceled_at: new Date() });

    return res.json({ msg: 'Delivery was cancelled' });
  }
}

export default new DeliveryProblemController();
