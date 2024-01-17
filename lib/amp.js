const five = require('johnny-five')

const MUTE_PIN = 'P1-7'

class Amp {
  constructor (board) {
    this.board = board
    this.board.i2cConfig()
    this.vol = undefined
    // Configure the raspi-io GPIO pin that will drive the MUTE signal 
    this.board.pinMode(MUTE_PIN, five.Pin.OUTPUT)
    this.mute(false)
  }

  getVolume () {
    return new Promise((resolve, reject) => {
      this.board.on('error', reject)
      this.board.i2cReadOnce(0x4B, 1, (volume) => {
        resolve(volume)
      })
    })
  }

  setVolume (vol) {
    if (vol > 63) return Promise.reject(RangeError('Volume must be between 0 and 63'))
    return new Promise((resolve, reject) => {
      this.board.on('error', reject)
      this.board.i2cWrite(0x4B, 0x00, vol)
      this.vol = vol
      resolve()
    })
  }

  mute (isMuted) {
    this.board.digitalWrite(MUTE_PIN, isMuted ? 0 : 1)     
  }
}

module.exports = Amp
