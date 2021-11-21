let UnixSocket = require('../index')

let us = new UnixSocket('/tmp/test-socket')
us.payloadAsJSON()

let dataToSend = {
	id: 1,
	name: 'alice',
	values: [0, 1, 2]
} 
us.send(dataToSend, (response) => {
	console.log(response)
})	