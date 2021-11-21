let UnixSocket = require('../index')

let us = new UnixSocket('/tmp/test-socket')
us.payloadAsJSON()

us.on('connect', () => {
	console.log('Connected')
})

us.listen((conn, msg) => {
	console.log(msg)
	us.reply(conn, {name: 'alice'})
})