/* eslint-env jest */
const net = require('net')
const SnapMeta = require('../lib/snap-meta.js')

describe('SnapMeta', () => {
  let snap
  beforeEach(() => {
    snap = new SnapMeta('host')
  })
  describe('SnapMeta#constructor', () => {
    it('throws if host is missing', () => {
      expect(() => {
        new SnapMeta() // eslint-disable-line no-new
      }).toThrow(TypeError)
    })
    it('defaults to port 1705', () => {
      expect(snap).toHaveProperty('port', 1705)
    })
    it('lets user assign a port', () => {
      snap = new SnapMeta('host', 1234)
      expect(snap).toHaveProperty('port', 1234)
    })
    it('creates a JSONRpc server', () => {
      expect(snap).toHaveProperty('rpc')
      expect(snap.rpc).toHaveProperty('receive')
    })
  })
  describe('SnapMeta#errorHandler', () => {
    it('invokes error callback', () => {
      snap.errorCallback = jest.fn()
      snap.errorHandler('error')
      expect(snap.errorCallback).toHaveBeenCalledWith('error')
    })
  })
  describe('SnapMeta#tcpData', () => {
    let buffer
    beforeEach(() => {
      buffer = Buffer.from(JSON.stringify({ a: 1 }))
    })
    it('passes JSON string to RPC', () => {
      snap.rpc.receive = jest.fn().mockResolvedValue()
      snap.tcpData(buffer)
      expect(snap.rpc.receive).toHaveBeenCalledWith({ a: 1 })
    })
    it('handles RPC errors', done => {
      snap.rpc.receive = jest.fn().mockRejectedValue()
      snap.errorHandler = done // if errorHandler is not called, the test will timeout
      snap.tcpData(buffer)
    })
  })
  describe('SnapMeta#rpcUpdate', () => {
    let params
    beforeEach(() => {
      params = {
        stream: {
          status: 'idle',
          properties: {
            metadata: {
              title: 'Test'
            }
          }
        }
      }
    })
    it('invokes dataCallback with metadata', (done) => {
      snap.dataCallback = (metadata) => {
        expect(metadata).toHaveProperty('title', 'Test')
        done() // will timeout if callback not called
      }
      snap.rpcUpdate(params)
    })
    it('handles params without stream', () => {
      delete params.stream
      expect(() => { snap.rpcUpdate(params) }).not.toThrow()
    })
    it('handles params without properties', () => {
      delete params.stream.properties
      expect(() => { snap.rpcUpdate(params) }).not.toThrow()
    })
    it('handles params without metadata', () => {
      delete params.stream.properties.metadata
      expect(() => { snap.rpcUpdate(params) }).not.toThrow()
    })
    it('invokes statusCallback with stream status', (done) => {
      snap.statusCallback = (status) => {
        expect(status).toEqual('idle')
        done()
      }
      snap.rpcUpdate(params)
    })
    it('handles params without status', () => {
      delete params.stream.status
      snap.statusCallback = jest.fn()
      expect(() => { snap.rpcUpdate(params) }).not.toThrow()
    })
  })
  describe('SnapClient#rpcProperties', () => {
    let params
    beforeEach(() => {
      params = {
        properties: {
          metadata: {
            title: 'Test'
          }
        }
      }
    })
    it('invokes dataCallback with metadata', (done) => {
      snap.dataCallback = (metadata) => {
        expect(metadata).toHaveProperty('title', 'Test')
        done()
      }
      snap.rpcProperties(params)
    })
    it('handles params without properties', () => {
      delete params.properties
      expect(() => { snap.rpcProperties(params) }).not.toThrow()
    })
    it('handles properties without metadata', () => {
      delete params.properties.metadata
      expect(() => { snap.rpcProperties(params) }).not.toThrow()
    })
    it('does nothing if dataCallback is undefined', () => {
      expect(() => { snap.rpcProperties(params) }).not.toThrow()
    })
  })
  describe('SnapMeta#on', () => {
    it('configures an error callback', () => {
      const callback = jest.fn()
      snap.on('error', callback)
      expect(snap.errorCallback).toEqual(callback)
    })
    it('configures a data callback', () => {
      const callback = jest.fn()
      snap.on('data', callback)
      expect(snap.dataCallback).toEqual(callback)
    })
    it('configures a status callback', () => {
      const callback = jest.fn()
      snap.on('status', callback)
      expect(snap.statusCallback).toEqual(callback)
    })
    it('throws if event is unsupported', () => {
      const callback = jest.fn()
      expect(() => {
        snap.on('bad-event', callback)
      }).toThrow(TypeError)
    })
    it('throws if callback is undefined', () => {
      expect(() => {
        snap.on('error', undefined)
      }).toThrow(TypeError)
    })
    it('throws if callback is not a function', () => {
      expect(() => {
        snap.on('bad-event', 'not-a-function')
      }).toThrow(TypeError)
    })
  })
  describe('SnapClient#open', () => {
    // open a port temporarily for testing
    let server
    beforeEach((done) => {
      server = net.createServer()
      server.listen(8080, done)
      snap.host = 'localhost'
      snap.port = 8080
      jest.spyOn(snap.socket, 'connect')
    })
    afterEach((done) => {
      server.close(done)
    })
    it('opens a socket', async () => {
      try {
        await snap.open()
        expect(snap.socket.connect).toHaveBeenCalledWith(8080, 'localhost')
      } finally {
        snap.socket.destroy()
      }
    })
    it('rejects on error', () => {
      snap.port = -1 // impossible port
      return expect(snap.open()).rejects.toThrow()
    })
  })
  describe('SnapMeta#close', () => {
    // open a port temporarily for testing
    let server
    beforeEach((done) => {
      snap.host = 'localhost'
      snap.port = 8080
      jest.spyOn(snap.socket, 'destroy')
      server = net.createServer()
      server.listen(8080, done)
    })
    afterEach((done) => {
      server.close(done)
    })
    it('closes a socket', async () => {
      await snap.open()
      await snap.close()
      expect(snap.socket.destroy).toHaveBeenCalled()
    })
  })
})
