const z = require('zod');
const { Op } = require("sequelize");

const db = require('../../models');

const schema = z.object({
  name: z.string({
    required_error: 'name field is required',
    invalid_type_error: 'name field must be a string',
  }),
  platform: z.enum(['', 'ios', 'android'],{
    required_error: 'platform field is required',
    invalid_type_error: 'platform field must be one of: ios, android',
  }),
});

const search = async(req, res) => {
  const zodResult = schema.safeParse(req.body);

  if(!zodResult.success) {
    return res.status(400).send({
      error: zodResult.error.issues[0].message,
    });
  }

  try {
    const body = zodResult.data;

    let whereQuery = {};
    
    if(body.platform) {
      whereQuery['platform'] = body.platform;
    }

    if(body.name) {
      whereQuery['name'] = { [Op.like]: `%${body.name}%` };
    }

    const query = Object.values(whereQuery).some((value) => value !== undefined) ? { where: whereQuery } : {};

    const games = await db.Game.findAll(query);

    return res.status(200).send(games);
  } catch(err) {
    console.log('There was an error querying games', JSON.stringify(err.message));

    return res.status(500).send(err);
  }
};

module.exports = search;
