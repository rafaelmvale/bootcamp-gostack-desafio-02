import * as Yup from 'yup';
import Deliverer from '../models/Deliverer';
import File from '../models/File';
import User from '../models/User';

class DelivererController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      emai: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const checkUserProvider = await await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const delivererExists = await Deliverer.findOne({
      where: { emai: req.body.emai },
    });

    const { avatar_id } = req.body;

    const isFile = await File.findOne({
      where: { id: avatar_id },
    });

    if (!isFile) {
      return res
        .status(401)
        .json({ error: 'You can only create Deliverer with avatar' });
    }

    if (delivererExists) {
      return res.status(400).json({ error: 'Deliverer already exists.' });
    }

    const { id, name, emai } = await Deliverer.create(req.body);

    return res.json({
      id,
      name,
      emai,
    });
  }

  async index(req, res) {
    const deliverer = await Deliverer.findAll({
      attributes: ['id', 'name', 'emai'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverer);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      emai: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { emai } = req.body;

    const deliverer = await Deliverer.findByPk(req.params.id);

    if (emai !== deliverer.emai) {
      const delivererExists = await Deliverer.findOne({ where: { emai } });

      if (delivererExists) {
        return res.status(400).json({ error: 'Deliverer already exists ' });
      }
    }
    const { id, name, avatar_id } = await deliverer.update(req.body);

    return res.json({
      id,
      name,
      emai,
      avatar_id,
    });
  }

  async delete(req, res) {
    const deliverer = await Deliverer.findByPk(req.params.id);

    if (!deliverer) {
      return res.status(400).json({
        error: 'Deliverer do not exist',
      });
    }

    if (deliverer.avatar_id) {
      await File.destroy({
        where: {
          id: deliverer.avatar_id,
        },
        individualHooks: true,
      });
    }

    await Deliverer.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.json('Deliverers was successfully canceled');
  }
}

export default new DelivererController();
