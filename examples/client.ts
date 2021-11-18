import UnixSocket from '../index'

let us = new UnixSocket('/tmp/test-socket')

us.formatIncomingMessage = (msg) => {
	return JSON.parse(msg)
}
us.formatOutgoingMessage = (msg) => {
	return JSON.stringify(msg)
}


us.send({name: 'bob'}, (response) => {
	console.log(response)
}, true)		
