const mongoose = require('mongoose')

mongoose
	.connect(process.env.DB_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(console.log('Connecting to DB'))
	.catch(e => console.log(e))
