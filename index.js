const express = require('express');
const cors = require('cors');
const router = require('./app/router.js');

const app = express();
const { PORT = 3000, } = process.env;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(router);


app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running!');
});