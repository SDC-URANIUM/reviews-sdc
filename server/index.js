const express = require('express');
const path = require('path');

const select = require('../database/queries/select.js');
const insertInto = require('../database/queries/insertInto.js');
const update = require('../database/queries/update.js');
const get = require('../database/helpers/get.js');

const app = express();

app.use(express.json());

app.get('/reviews', (req, res) => {
  // console.log('entering reviews endpoint');

  const productId = req.query.product_id;
  // console.log(req.query);
  const page = req.query.page;
  const count = req.query.count || 5;

  const startIndex = page * count;
  const endIndex = startIndex + count;

  const response = {};

  response.product = productId;
  response.page = page;
  response.count = count;

  select.reviewsByProductId(productId, (error, reviews) => {
    if (error) {
      res.sendStatus(404);
    } else {
      response.results = reviews.slice(startIndex, endIndex);
      res.status(200).send(response);
    }
  });
});

app.get('/reviews/meta', (req, res) => {
  console.log('entering meta endpoint');
});

app.post('/reviews', (req, res) => {
  // console.log('entering post reviews endpoint');

  const data = req.body;
  // console.log(JSON.stringify(data));
  const date = new Date();
  const time = date.getTime();

  const values = [null, data.product_id, data.rating, time, data.summary, data.body, data.recommend, false, data.name, data.email, null, 0];

  update.recommendations(data.recommend, data.product_id);
  update.ratings(data.rating, data.product_id);
  update.reviews(values, data.photos, data.characteristics, (error, result) => {
    if (error) res.sendStatus(500);
    else res.status(201).send(result);
  });
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  // console.log('entering helpful endpoint');
  const review_id = req.query.review_id;

  update.helpfulness(review_id, (error, result) => {
    if (error) res.sendStatus(500);
    else res.status(200).send(result);
  })
});

app.put('/reviews/:review_id/report', (req, res) => {
  // console.log('entering report endpoint');

  const review_id = req.query.review_id;

  update.reported(review_id, (error, result) => {
    if (error) res.sendStatus(500);
    else res.status(200).send(result);
  })
});

const PORT = 3000;

app.listen(PORT);
console.log('Server listening at http://localhost:3000');