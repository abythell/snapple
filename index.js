const SnapMeta = require('./lib/snap-meta.js')

const snap = new SnapMeta('192.168.0.2')
snap.on('error', console.error)
snap.on('data', console.log)
snap.open().then(() => {
  console.log('Opened control client')
}).catch(console.err)

process.on('SIGINT', () => {
  snap.close().then(() => {
    console.log('Closed control client')
  }).catch(console.err)
})
