class Amp {
  constructor (board) {
    this.board = board
    this.board.i2cConfig()
    this.vol = undefined
  }

  getVolume () {
    return new Promise((resolve, reject) => {
      this.board.on('error', reject)
      this.board.i2cReadOnce(0x4B, 1, (byte) => {
        this.vol = byte
        resolve()
      })
    })
  }

  setVolume (vol) {
    if (vol > 63) return Promise.reject(RangeError('Volume must be between 0 and 63'))
    return new Promise((resolve, reject) => {
      this.board.on('error', reject)
      this.board.i2cWrite(0x4B, 0x00, vol)
    })
  }

  async mute () {
    this.vol = await this.getVolume()
    return this.setVolume(0)
  }

  unmute () {
    if (this.vol) {
      return this.setVolume(this.vol)
    }
  }
}

module.exports = Amp
