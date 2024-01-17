const net = require('net')
const { JSONRPCServer } = require('json-rpc-2.0')

/**
 * Get Snapcast Metadata over TCP.  Connects to a Snapcast server and receives
 * notifications when stream status or metadata changes.
 * @class
 */
class SnapMeta {
  /**
   * @constructor
   * @param {string} host - FQDN or IP address of Snapcast server
   * @param {number} [port=1705] - Snapcast JSONRPC port.
   */
  constructor (host, port) {
    if (!host) throw TypeError('missing Snapserver host')
    this.host = host
    this.port = port || 1705
    this.socket = new net.Socket()
    this.errorCallback = undefined
    this.dataCallback = undefined
    this.statusCallback = undefined
    this.rpc = new JSONRPCServer({ errorListener: this.errorHandler.bind(this) })
    this.rpc.addMethod('Stream.OnUpdate', this.rpcUpdate.bind(this))
    this.rpc.addMethod('Stream.OnProperties', this.rpcProperties.bind(this))
    this.socket.on('error', this.errorHandler.bind(this))
    this.socket.on('data', this.tcpData.bind(this))
  }

  /**
   * Invoke the use-supplied error handler.  Called when there are Socket
   * or JSONRPC errors.
   * @private
   * @param {Error} err
   */
  errorHandler (err) {
    if (this.errorCallback) this.errorCallback(err)
  }

  /**
   * Handler for incoming Socket / TCP data.  Passes messages to JSONRCP
   * for parsing.  Calls user-supplied error callback on error.
   * @private
   * @param {Buffer} buffer - Raw data sent from Snapcast server
   */
  tcpData (buffer) {
    const data = JSON.parse(buffer.toString())
    // all incoming data is passed to JSONRPC
    // configure JSONRPC to handle specific messages
    this.rpc.receive(data).catch(this.errorHandler)
  }

  /**
   * Handler for Snapcast Stream.OnUpdate RCP messages.  Invoked by the
   * JSONRPC parser.  Calls the data callback when the message contains
   * metadata, and the status callback when the message contains stream
   * status.
   * @see https://github.com/badaix/snapcast/blob/develop/doc/json_rpc_api/control.md#streamonupdate
   * @private
   * @param {Object} params - JSONRPC message parameters
   */
  rpcUpdate (params) {
    if (params.stream && this.dataCallback) {
      this.dataCallback(params.stream.properties.metadata)
    }
    if (params.stream && params.stream.status && this.statusCallback) {
      this.statusCallback(params.stream.status)
    }
  }

  /**
   * Handler for Snapcast Stream.OnProperties RCP messages.  Invoked by the
   * JSONRPC parser.  Calls the data callback when the message contains
   * metadata.
   * @see https://github.com/badaix/snapcast/blob/develop/doc/json_rpc_api/control.md#streamonupdate
   * @private
   * @param {Object} params - JSONRPC message parameters
   */
  rpcProperties (params) {
    if (params.properties && params.properties.metadata && this.dataCallback) {
      this.dataCallback(params.properties.metadata)
    }
  }

  /**
   * User-defined callback for handling Snapcast metadata messages
   * @see https://github.com/badaix/snapcast/blob/develop/doc/json_rpc_api/stream_plugin.md#pluginstreamplayergetproperties
   * @callback dataCallback
   * @param {Object} metadata - The metadata object (only) from the RCP message
  */

  /**
   * User-defined callback for handling Snapcast status messages
   * @callback statusCallback
   * @param {string} status - The stream status:  idle, playing, etc.
   */

  /**
   * User-define callback for handling errors.  Errors can be generated from
   * Socket, JSONRPC, etc.
   * @callback errorCallback
   * @param {Error} error
   */

  /**
   * Configure user-defined callbacks to handle incoming Snapcast metadata and
   * status messages.
   * @param {('error'|'data'|'status')} event
   * @param {dataCallback|statusCallback|errorCallback } callback
   */
  on (event, callback) {
    if (typeof callback !== 'function') throw TypeError('Callback is not a function')
    switch (event) {
      case 'error':
        this.errorCallback = callback
        break
      case 'data':
        this.dataCallback = callback
        break
      case 'status':
        this.statusCallback = callback
        break
      default:
        throw TypeError(`Unsupported event: ${event}`)
    }
  }

  /**
   * Open the connection to the Snapcast server.
   * @returns {Promise} Resolves on success, rejects on error
   */
  open () {
    return new Promise((resolve, reject) => {
      this.socket.on('ready', resolve)
      this.socket.on('error', reject)
      this.socket.connect(this.port, this.host)
    })
  }

  /**
   * Close the connection to the Snapcast server.
   * @returns {Promise} Resolves on success, rejects on error
   */
  close () {
    return new Promise((resolve, reject) => {
      this.socket.on('close', resolve)
      this.socket.on('error', reject)
      this.socket.end()
    })
  }
}

module.exports = SnapMeta
