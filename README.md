# Unix Domain Socket

Wrapper around Node Net SOCK_STREAM.

## Usage

**Server:**

```js
let UnixSocket = require('unix-domain-socket')

let us = new UnixSocket('/tmp/test-socket')

us.listen((conn, msg) => {
  console.log(msg)
  us.reply(conn, 'alice')
})
```

**Client:**

```js
let UnixSocket = require('unix-domain-socket')

let us = new UnixSocket('/tmp/test-socket')

us.send('bob', (response) => {
  console.log(response)
})		

// Keep the connection alive
us.send('bob', (response) => {
  console.log(response)
}, true) 		
```

## Builtin JSON formatter

```js
let UnixSocket = require('../index')
let us = new UnixSocket('/tmp/test-socket')

us.payloadAsJSON()

const dataToSend = {
	id: 1,
	name: 'alice',
	values: [0, 1, 2]
} 

us.send(dataToSend, (response) => {
	console.log(response)
})	

```

## Configuration

Custom messagge kind parser:

```js
let UnixSocket = require('unix-domain-socket')

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
```

Configure the delimiter:

```js
let us = new UnixSocket('/tmp/test-socket', {
  endDelimiter: '__MY_CUSTOM_DELIMITER__'
})
```

## Events

```js
let UnixSocket = require('unix-domain-socket')

let us = new UnixSocket('/tmp/test-socket')

us.on('connect', () => {
	console.log('Connected')
})

us.on('data', (data) => {
	console.log('Data', data)
})

us.on('error', (err) => {
	console.log('Error', err)
})

us.on('close', () => {
	console.log('Close')
})

```

## Private fields accessor

```js

let serverInstance = us.getServer()
let clientInstance = us.getClient()
```
