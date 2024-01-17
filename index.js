const SnapMeta = require('./lib/snap-meta.js')
const Raspi = require('raspi-io').RaspiIO
const five = require('johnny-five')
const LCD = require('./lib/lcd.js')
const Amp = require('./lib/amp.js')

require('dotenv').config()
const board = new five.Board({ io: new Raspi(), repl: false })
const lcd = new LCD()
const amp = new Amp(board)
const snap = new SnapMeta(process.env.SNAPSERVER)

board.on('ready', () => {
  lcd.begin()
  amp.begin()
  snap.on('error', errorHandler)
  snap.on('data', (metadata) => {
    try {
      lcd.setTitle(metadata.title)
    } catch (err) {
      // call our own error handler, instead of letting JSON-RPC handle it
      errorHandler(err)
    }
  })
  snap.on('status', (status) => {
    try {
      lcd.setStatus(status)
    } catch (err) {
      // call our own error handler, instead of letting JSON-RPC handle it
      errorHandler(err)
    }
  })
  snap.open().then(() => {
    lcd.setStatus('starting')
  }).catch(errorHandler)

  process.on('SIGINT', () => {
    lcd.clear()
    snap.close().then(() => {
      process.exit(0)
    }).catch(errorHandler)
  })

  function errorHandler (err) {
    console.error(err)
    try {
      lcd.setStatus('error')
      lcd.setTitle(err.message)
    } catch (err) {
      console.error(err)
    }
  }
})
