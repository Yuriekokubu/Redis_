const express = require('express');
const redis = require('redis');
const util = require('util');
const axios = require('axios');

const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);

client.set = util.promisify(client.set);
client.get = util.promisify(client.get);

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  const { key, value } = req.body;

  const response = await client.set(key, value);
  res.json(response);
});

app.get('/', async (req, res) => {
  const { key } = req.body;
  const value = await client.get(key);
  res.json(value);
});

app.get('/posts/:id', async (req, res) => {
  const { id } = req.params;

  const cachePost = await client.get(`post-${id}`);

  if (cachePost) {
    return res.json(JSON.parse(cachePost));
  }

  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );

  client.set(`post-${id}`, JSON.stringify(data), 'EX', 1);
  return res.json(data);
});

app.listen(8080, () => {
  console.log('Hey,now listening on port 8080');
});
