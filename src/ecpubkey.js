var assert = require('assert')
var crypto = require('./crypto')
var ecdsa = require('./ecdsa')
var networks = require('./networks')

var Address = require('./address')
var ECPointFp = require('./ec').ECPointFp

var sec = require('./sec')
var ecparams = sec('secp256k1')

function ECPubKey(Q, compressed) {
  assert(Q instanceof ECPointFp, 'Expected ECPointFP, got ' + Q)

  if (compressed == undefined) compressed = true
  assert.strictEqual(typeof compressed, 'boolean', 'Expected boolean, got ' + compressed)

  this.compressed = compressed
  this.Q = Q
}

// Static constructors
ECPubKey.fromBuffer = function(buffer) {
  var decode = ECPointFp.decodeFrom(ecparams.getCurve(), buffer)
  return new ECPubKey(decode.Q, decode.compressed)
}

ECPubKey.fromHex = function(hex) {
  return ECPubKey.fromBuffer(new Buffer(hex, 'hex'))
}

// Operations
ECPubKey.prototype.getAddress = function(network) {
  network = network || networks.bitcoin

  return new Address(crypto.hash160(this.toBuffer()), network.pubKeyHash)
}

ECPubKey.prototype.verify = function(hash, signature) {
  return ecdsa.verify(ecparams, hash, signature, this.Q)
}

// Export functions
ECPubKey.prototype.toBuffer = function() {
  return this.Q.getEncoded(this.compressed)
}

ECPubKey.prototype.toHex = function() {
  return this.toBuffer().toString('hex')
}

module.exports = ECPubKey
