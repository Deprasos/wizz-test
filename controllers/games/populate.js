const _ = require('lodash');

const db = require('../../models');

const loadAndPreProcessData = (platform) => {
  let fileData;

  if(platform === 'android') {
    fileData = require('../../data/android.top100.json');
  } else if(platform === 'ios') {
    fileData = require('../../data/ios.top100.json');
  }

  // Array manipulations:
  // Flatten the array because data are stored like this: [ [game1, game2, game3], [game4, game5, game6], ...]
  // Remove potential duplication of games using app_id,
  // Sort games by rating with first game being the most populare one
  // Extract first 100 games
  // Map and extract the desired data to the db format
  return _.uniq(_.flattenDeep(fileData), (e) => e.app_id).sort((a, b) => a.rating > b.rating).slice(0, 100).map((game) => {
    return {
      publisherId: game.publisher_id,
      name: game.name,
      platform,
      storeId: game.appId,
      bundleId: game.bundle_id,
      appVersion: game.version,
      isPublished: true
    }
  });
}

const populate = async(_req, res) => {
  try {
    const iosGames = loadAndPreProcessData('ios');
    const androidGames = loadAndPreProcessData('android');

    // We should validate that we don't create a game twice in case of re-import
    const result = await db.Game.bulkCreate([...iosGames, ...androidGames]);

    console.log(`Added ${result.length} games in db`);

    return res.status(204).send();
  } catch(err) {
    console.log('There was an error populating games', JSON.stringify(err.message));

    return res.status(500).send(err);
  }
};

module.exports = populate;
