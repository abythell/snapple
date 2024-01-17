const five = require('johnny-five')

const MUTE_PIN = 'P1-7'
const SHDN_PIN = 'P1-11'
const I2C_ADDR = 0x4b

/**
 * Control an Adafruit MAX9744 amplifier using Johnny-Five.
 * The amp uses i2c for volume control and optional GPIO pins for mute and
 * shutdown.
 *
 * @example Wiring Diagram for Raspberry Pi Model B (Colors are arbitrary)
 * SIGNAL AMP PI    COLOR   NOTE
 * SDA0   4   P1-3  green
 * SCL0   5   P1-5  yellow
 * VI2C   6   P1-1  orange  3V3 for Pi, other boards may need 5V
 * GND    13  P1-6  brown
 * VCC    14  P1-4  red     Optional - Use to power Amp with 5V from Pi
 * MUTE   8   P1-7  blue    Optional - Connect to use `Amp.mute()`
 * SHDN   6   P1-11 white   Optional - Connect to use `Amp.shutdown()`
 *
 * @see https://learn.adafruit.com/adafruit-20w-stereo-audio-amplifier-class-d-max9744/pinouts
 * @see https://github.com/nebrius/raspi-io/wiki/Pin-Information
 * @class
 * @param {Board} board - Instance of a Johnny-Five `Board`.
 * @param {Object} options
 * @param {string|number} [options.mute="P1-7"] - GPIO pin connected to MUTE
 * @param {string|number} [options.shutdown="P1-11"] - GPIO pin connected to SHDN
 * pin.
 */
class Amp {
  constructor (board, options) {
    if (!board) throw TypeError('Missing board')
    this.board = board
    this.mutePin = (options && options.mute) ? options.mute : MUTE_PIN
    this.shutdownPin = (options && options.shutdown) ? options.shutdown : SHDN_PIN
  }

  /**
   * Initialize the hardware.  Call this after the board has been initialized
   * (ie. from the board 'ready' handler)
   */
  begin () {
    this.board.i2cConfig()
    // always start with the amp is powered-up
    // TODO: get and/or restore previous volume level?
    this.board.pinMode(this.shutdownPin, five.Pin.OUTPUT)
    this.shutdown(false)
    // always start unmuted
    this.board.pinMode(this.mutePin, five.Pin.OUTPUT)
    this.mute(false)
  }

  /**
   * Get the current volume level.  Volume and mute are independent, ie.
   * The volume might be 63 but there won't be any sound if the amp is muted.
   * @returns {Promise<number>} Resolves with a number between 0 and 63, rejects
   * on error.
   */
  getVolume () {
    return new Promise((resolve, reject) => {
      this.board.on('error', reject)
      this.board.i2cReadOnce(I2C_ADDR, 1, (volume) => {
        resolve(volume)
      })
    })
  }

  /**
   * Set the volume level.
   * @param {number} vol - A volume level between 0 and 63
   * @returns {Promise} Resolves on success.
   */
  setVolume (vol) {
    if (vol > 63) return Promise.reject(RangeError('Volume must be between 0 and 63'))
    return new Promise((resolve, reject) => {
      this.board.on('error', reject)
      this.board.i2cWrite(I2C_ADDR, 0x00, vol)
      resolve()
    })
  }

  /**
   * Mute and unmute.  Volume level is preserved.
   * @param {boolean} isMuted - Set true to mute the amp, false to unmute.
   */
  mute (isMuted) {
    // mute is enabled when the pin is LOW
    this.board.digitalWrite(this.mutePin, isMuted ? 0 : 1)
  }

  /**
   * Put the amp into low-power mode, or wake it up.
   * @param {boolean} isShutdown - Set true to shutdown the amp and enter
   * low-power mode, or false to power it up.
   */
  shutdown (isShutdown) {
    // shutdown is enabled when the pin is LOW
    this.board.digitalWrite(this.shutdownPin, isShutdown ? 0 : 1)
  }
}

module.exports = Amp
