let net = require('net')
let fs = require('fs')

module.exports = class UnixSocket {
	#socketFile: string
	#client: any
	#server: any
	#opt: any
	#onMessageCallback: Function
	#dataStream: string
	#regexMatch: any
	#onEvents: any
	formatIncomingMessage: Function
	formatOutgoingMessage: Function

	constructor (socketFile, options = null) {
		this.#socketFile = socketFile
		this.#client = null
		this.#server = null	
		this.#onMessageCallback	= (conn, mex) => {}
		this.#dataStream = ''
		this.#onEvents = {}
		this.#opt = {
			log: true,
			endDelimiter: '__STREAM__END__' 
		}
		if (options !== null) {
			Object.keys(options).forEach(function (k) {
				this.#opt[k] = options[k]
			}.bind(this))
		}
		this.#regexMatch = new RegExp(`${this.#opt.endDelimiter}`)
	}

	static IncomingJSON (msg) {
		return JSON.parse(msg)
	}

	static OutgoingJSON (msg) {
		return JSON.stringify(msg)	
	}

	payloadAsJSON () {
		this.formatIncomingMessage = UnixSocket.IncomingJSON
		this.formatOutgoingMessage = UnixSocket.OutgoingJSON
	}

	getServer () {
		return this.#server
	}

	getClient () {
		return this.#client
	}

	/**
	 * Add callback to events 
	 */
	on (eventName, cb: Function) {
		this.#onEvents[eventName] = cb
	}	

	/**
	 * Start the server
	 */
	listen (cb: Function) {
		this._server()
		this.#onMessageCallback = cb
	}

	/**
	 * Start the client
	 */
	send (msg, cb, keep = false) {
		this._client(keep)
		this.#onMessageCallback = cb			
		this.#client.write(this.formatMessage(msg))
	}

	/**
	 * The server can send back data
	 * to the client connection
	 */ 
	reply (conn, msg) {
		conn.write(this.formatMessage(msg))
	}	

	// Alias for this.reply
	sendBack (conn, msg) {
		this.reply(conn, msg)
	}

	private _server () {		
		if (this.#client !== null || this.#server !== null) {
			return 
		}
		this._cleanupSocketFile(function () {
        	this.#server = net.createServer(function(connection: any) {      		
        	    connection.on('end', function() {
        	    	this.fireOnEvent('end')
        	    }.bind(this))
        	    connection.on('data', function (data: any) {
					this.onData(connection, data)
					this.fireOnEvent('data', data)
        	    }.bind(this))
        	    connection.on('error', function (data: any) {
					this.fireOnEvent('error', data)
        	    }.bind(this))        	    
        	}.bind(this)).listen(this.#socketFile).on('connection', function(socket: any) {
        	    //console.log(new Date(), '#> Unix Socket connection') 
        	    this.fireOnEvent('connect') 
        	}.bind(this))		
        }.bind(this))
        return this
	}

	private _client (keep) {
		if (this.#client !== null || this.#server !== null) {
			return 
		}		
		this.#client = net.createConnection(this.#socketFile)
		this.#client.on('connect', function () {
			this.fireOnEvent('connect')
        }.bind(this))   
        this.#client.on('close', function () {
            this.#client = null
            this.fireOnEvent('close')
        }.bind(this))                
        this.#client.on('data', function (data) {
        	this.onData(null, data, keep)
        	this.fireOnEvent('data', data)
        }.bind(this)).on('end', function () {
            this.#client = null
            this.fireOnEvent('end')
        }.bind(this)).on('error', function(data) {
            this.fireOnEvent('error', data)
        }.bind(this))		
        return this
	}

	private _cleanupSocketFile (createServerCb) {
    	fs.stat(this.#socketFile, function (err: any, stats: any) {
    	    if (err) { 
    	    	createServerCb()
    	        return
    	    }
    	    fs.unlink(this.#socketFile, function(err: any) {
    	        if(err) {
    	            console.error(err)
    	        }
    	        createServerCb()
    	        return
    	    }) 
    	}.bind(this))	
	}

	private formatMessage (msg) {
		if (this.formatOutgoingMessage !== undefined) {
			msg = this.formatOutgoingMessage(msg)
		}
		return msg + this.#opt.endDelimiter
	}

	private onData (connection, data, keep = false) {
        const delimiter = this.#opt.endDelimiter
        let matchRes = data.toString().match(this.#regexMatch)
        if (matchRes) {
            this.#dataStream += data.toString().split(delimiter)[0]
			if (this.formatIncomingMessage !== undefined) {
				this.#dataStream = this.formatIncomingMessage(this.#dataStream)
			}             
            if (connection == null) {            	
            	this.#onMessageCallback(this.#dataStream)	
				if (keep == false) {
				    this.#client.end()    
				}                 	
            } else {
            	this.#onMessageCallback(connection, this.#dataStream)
            }
            this.#dataStream = ''                    
        } else {
            this.#dataStream += data
        }   		
	} 

	private fireOnEvent (event, data) {
		const eventCb = this.#onEvents[event]
		if (eventCb !== undefined 
			&& eventCb !== null && typeof eventCb == 'function') {
			eventCb(data)
		}
	}
}