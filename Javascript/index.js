const axios = require('axios');
const { ConcurrencyManager } = require('axios-concurrency');
const R = require('ramda');
const fs = require('fs');

const MAX_CONCURRENT_REQUESTS = 1;
const INTERVAL = 50;
const START = 2131;
const END = START + INTERVAL - 1;

let api = axios.create({
  baseURL: 'https://api.opendota.com',
});

const saveToFile = ({ filename, data }) => {
  const json = JSON.stringify(data);
  fs.writeFileSync(`${filename}.json`, json);
};

const read = R.pipe(
  fs.readFileSync,
  JSON.parse
);

const matchLabels = [
  'match_id',
  'first_blood_time',
  'radiant_win',
  'duration',
  'players',
];
const playerLabels = [
  'hero_id',
  'kda',
  'hero_damage',
  'gold_per_min',
  'xp_per_min',
  'isRadiant',
];

const parseMatch = R.pipe(
  R.prop('data'),
  R.pickAll(matchLabels),
  e => ({
    ...e,
    players: R.map(R.pickAll(playerLabels), e.players),
  })
);

const main = async () => {
  try {
    console.log('Start');
    const ids = read('data/matchesId.json');
    const manager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS);
    const urls = R.map(
      id => api.get(`/api/matches/${id}`),
      R.slice(START, END, ids)
    );
    const result = await Promise.all(urls);
    manager.detach();
    const data = R.map(parseMatch, result);
    saveToFile({ filename: `data/matches[${START}-${END}]`, data });
    console.log('End');
  } catch (err) {
    console.log(err);
  }
};

main();
