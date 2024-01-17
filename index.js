const SnapMeta = require('./lib/snap-meta.js')
const Raspi = require('raspi-io').RaspiIO
const j5 = require('johnny-five')
const LCD = require('./lib/lcd.js')

require('dotenv').config // eslint-disable-line no-unused-expressions
const board = new j5.Board({ io: new Raspi(), repl: false })

board.on('ready', () => {
  const lcd = new LCD(j5)
  const snap = new SnapMeta(process.env.SNAPSERVER)

  snap.on('error', console.error)

  snap.on('data', (metadata) => {
    lcd.title(metadata.title)
  })

  snap.on('status', lcd.setStatus)

  snap.open().then(() => {
    lcd.setTitle('Starting')
  }).catch(console.err)

  process.on('SIGINT', () => {
    snap.close().then(() => {
      process.exit(0)
    }).catch(console.err)
  })
})


