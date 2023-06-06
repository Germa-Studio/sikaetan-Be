const express = require('express');
const cors = require('cors');
const router = require('./app/router');

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
  console.log(`server is running! on http://localhost:${PORT}`);
});