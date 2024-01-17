/* eslint-env jest */
const LCD = require('../lib/lcd.js')

describe('LCD', () => {
  describe('LCD#constructor', () => {
    it('uses default pin assignment', () => {
      const lcd = new LCD()
      expect(lcd.pins).toEqual(['P1-11', 'P1-13', 'P1-15', 'P1-19', 'P1-21', 'P1-23'])
    })
    it('uses user pin assignment', () => {
      const pins = [1, 2, 3, 4, 5, 6]
      const lcd = new LCD(pins)
      expect(lcd.pins).toEqual(pins)
    })
  })
  describe('LCD#update', () => {
    let lcd, mockLCD
    beforeEach(() => {
      mockLCD = {
        cursor: jest.fn().mockReturnThis(),
        print: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis()
      }
      lcd = new LCD()
      lcd.lcd = mockLCD
    })
    it('clears the lcd', () => {
      lcd.update({ title: 'test' })
      expect(mockLCD.clear).toHaveBeenCalled()
    })
    it('updates the title', () => {
      lcd.update({ title: 'test' })
      expect(lcd).toHaveProperty('title', 'test')
    })
    it('updates the status', () => {
      lcd.update({ status: 'test' })
      expect(lcd).toHaveProperty('status', 'test')
    })
    it('updates the volume', () => {
      lcd.update({ volume: 'test' })
      expect(lcd).toHaveProperty('volume', 'test')
    })
  })
})
