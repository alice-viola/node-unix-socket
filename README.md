# Unix Domain Socket

Wrapper around Node Net SOCK_STREAM.

## Usage

**Server:**

```js
let UnixSocket = require('unix-domain-socket')

let us = new UnixSocket('/tmp/test-socket')

us.listen((conn, msg) => {
  console.log(msg)
  us.sendBack(conn, 'alice')
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

## Configuration

Custom messagge formatter:

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


