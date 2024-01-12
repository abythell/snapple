const SnapMeta = require('./lib/snap-meta.js')
const Raspi = require('rasp-io').RaspiIO
const j5 = require('johnny-five')
const LCD = require('./lib/lcd.js')
require('dontenv').config // eslint-disable-line no-unused-expressions

/**
 * Initialize Hardware
 */
let lcd
const board = new j5.Board({ io: new Raspi(), repl: false })
board.on('ready', () => {
  lcd = new LCD(j5)
})

/**
 * Configure Snapcast
 */
const snap = new SnapMeta(process.env.SNAPSERVER)
snap.on('error', console.error)
snap.on('data', (metadata) => {
  lcd.title(metadata.title)
})
snap.on('status', lcd.status)
snap.open().then(() => {
  lcd.title('Starting')
}).catch(console.err)

process.on('SIGINT', () => {
  snap.close().then(() => {
    process.exit(0)
  }).catch(console.err)
})
