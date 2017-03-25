module.exports = {
	'port': process.env.PORT || 8080,
	'db': process.env.MONGODB_URI || 'mongodb://localhost/sengdb',
	secret: "Hello 2016"
};