/**
 * Display Snapcast data on an HD44780-based 20x4 LCD using Johnny-Five.
 * @see https://johnny-five.io/api/lcd/
 * @see https://github.com/nebrius/raspi-io/wiki/Pin-Information
 * @see https://learn.adafruit.com/character-lcds/wiring-a-character-lcd
 * @class
 */

const five = require('johnny-five')

const RS_PIN = 'P1-11'
const EN_PIN = 'P1-13'
const D4_PIN = 'P1-15'
const D5_PIN = 'P1-19'
const D6_PIN = 'P1-21'
const D7_PIN = 'P1-23'

class LCD {
  /**
   * @constructor
   * @param {Object} [pins] - Johnny-Five LCD pin map (if not using defaults)
   */
  constructor (pins) {
    this.status = undefined
    this.title = undefined
    this.volume = undefined
    this.pins = pins || [ RS_PIN, EN_PIN, D4_PIN, D5_PIN, D6_PIN, D7_PIN ] 
  }

  /**
   * Initialize the hardware.  Call this only after the board is ready.
   */
  begin () {
    this.lcd = new five.LCD({
      rows: 2,
      cols: 20,
      pins: this.pins
    })
  }

  /**
   * Update the entire LCD display.  If a parameter is omitted, the
   * previous value persists.
   * @param {Object} args
   * @param {string} [args.title]
   * @param {string} [args.status]
   * @param {string|number} [args.volume]
   */
  update (args) {
    if (Object.prototype.hasOwnProperty.call(args, 'title')) this.title = args.title
    if (Object.prototype.hasOwnProperty.call(args, 'status')) this.status = args.status
    if (Object.prototype.hasOwnProperty.call(args, 'volume')) this.volume = args.volume
    this.lcd.clear()
    if (this.status !== undefined) this.lcd.cursor(0, 0).print(this.status)
    if (this.title !== undefined) this.lcd.cursor(1, 0).print(this.title)
    if (this.volume !== undefined) this.lcd.cursor(2, 0).print(this.volume)
  }

  setTitle (value) {
    this.update({ title: value })
  }

  setStatus (value) {
    this.update({ status: value })
  }

  setVolume (value) {
    this.update({ volume: value })
  }

  clear () {
    this.lcd.clear()
  }
}

module.exports = LCD
