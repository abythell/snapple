/**
 * Display Snapcast data on 20x4 LCD using Johnny-Five
 */
class LCD {
  /**
   * @constructor
   * @param {Object} j5 - A johnny-five instance.  Connect to board first.
   */
  constructor (j5) {
    this.status = undefined
    this.title = undefined
    this.lcd = new j5.LCD({
      pins: ['P1-11', 'P1-13', 'P1-15', 'P1-19', 'P1-21', 'P1-23'],
      rows: 2,
      cols: 20
    })
  }

  update (args) {
    if (Object.prototype.hasOwnProperty.call(args, 'title')) this.title = args.title
    if (Object.prototype.hasOwnProperty.call(args, 'status')) this.status = args.status
    this.lcd.clear()
    if (this.status !== undefined) this.lcd.cursor(0, 0).print(this.status)
    if (this.title !== undefined) this.lcd.cursor(1, 0).print(this.title)
  }

  setTitle (value) {
    this.update({ title: value })
  }

  setStatus (value) {
    this.update({ status: value })
  }

  clear () {
    this.lcd.clear()
  }
}

module.exports = LCD
