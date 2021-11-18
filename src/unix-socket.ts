let net = require('net')
let fs = require('fs')

class UnixSocket {
	#socketFile: string
	#client: any
	#server: any
	#opt: any
	#onMessageCallback: Function
	#dataStream: string
	#regexMatch: any
	formatIncomingMessage: Function
	formatOutgoingMessage: Function

	constructor (socketFile, options = null) {
		this.#socketFile = socketFile
		this.#client = null
		this.#server = null	
		this.#onMessageCallback	= (conn, mex) => {}
		this.#dataStream = ''
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

	listen (cb: Function) {
		this._server()
		this.#onMessageCallback = cb
	}

	send (msg, cb, keep = false) {
		this._client(keep)
		this.#onMessageCallback = cb			
		this.#client.write(this.formatMessage(msg))
	}

	sendBack (conn, msg) {
		conn.write(this.formatMessage(msg))
	}

	private _server () {		
		if (this.#client !== null || this.#server !== null) {
			return 
		}
		this._cleanupSocketFile(function () {
        	this.#server = net.createServer(function(connection: any) {
        	    // let self = Date.now();
        	    // connections[self] = (stream)
        	    connection.on('end', function() {
        	        //console.log(new Date(), '#> Unix connection end')
        	    })
        	    connection.on('data', function (data: any) {
					this.onData(connection, data)
        	    }.bind(this))
        	}.bind(this)).listen(this.#socketFile).on('connection', function(socket: any) {
        	    //console.log(new Date(), '#> Unix Socket connection')  
        	})		
        }.bind(this))
        return this
	}

	private _client (keep) {
		if (this.#client !== null || this.#server !== null) {
			return 
		}		
		this.#client = net.createConnection(this.#socketFile)
		this.#client.on('connect', function () {

        }.bind(this))   
        this.#client.on('close', function () {
            this.#client = null
        }.bind(this))                
        this.#client.on('data', function (data) {
        	this.onData(null, data, keep)
        }.bind(this)).on('end', function () {
            this.#client = null
        }.bind(this)).on('error', function(data) {
            console.error('Server disconnected') 
        })		
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
}

export default UnixSocket