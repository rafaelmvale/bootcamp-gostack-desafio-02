import File from '../models/File';

class SignatureController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.signature;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new SignatureController();
