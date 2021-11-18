let UnixSocket = require('../index')

let us = new UnixSocket('/tmp/test-socket')

us.formatIncomingMessage = (msg) => {
	return JSON.parse(msg)
}
us.formatOutgoingMessage = (msg) => {
	return JSON.stringify(msg)
}

us.listen((conn, msg) => {
	console.log(msg)
	us.sendBack(conn, {name: 'alice'})
})