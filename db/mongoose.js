const mongoose = require('mongoose');

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(console.log('Connected to DB'))
  .catch(e => console.log(e));
