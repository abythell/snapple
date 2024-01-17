/* eslint-env jest */
const Amp = require('../lib/amp.js')

describe('Amp', () => {
  const board = 'placeholder'
  describe('Amp#constructor', () => {
    it('throws if board arg is missing', () => {
      expect(() => {
        new Amp() /* eslint-disable-line no-new */
      }).toThrow(TypeError)
    })
    it('sets the default mute pin', () => {
      const amp = new Amp(board)
      expect(amp).toHaveProperty('mutePin', 'P1-7')
    })
    it('allows user to override the mute pin', () => {
      const amp = new Amp(board, { mute: 'test' })
      expect(amp).toHaveProperty('mutePin', 'test')
    })
    it('sets the default shutdown pin', () => {
      const amp = new Amp(board)
      expect(amp).toHaveProperty('shutdownPin', 'P1-11')
    })
    it('allows user to override the shutdown pin', () => {
      const amp = new Amp(board, { shutdown: 'test' })
      expect(amp).toHaveProperty('shutdownPin', 'test')
    })
  })
})
