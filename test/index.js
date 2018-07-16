'use strict'
let tape = require('tape')
let fixtures = require('./fixtures')
let bip173 = require('../')

fixtures.bip173.valid.forEach((f) => {
  tape(`fromWords/toWords ${f.hex}`, (t) => {
    t.plan(2)

    let words = bip173.toWords(Buffer.from(f.hex, 'hex'))
    let bytes = Buffer.from(bip173.fromWords(f.words))
    t.same(words, f.words)
    t.same(bytes.toString('hex'), f.hex)
  })

  tape(`encode ${f.prefix} ${f.hex}`, (t) => {
    t.plan(1)
    t.strictEqual(bip173.encode(f.prefix, f.words, f.limit), f.string.toLowerCase())
  })

  tape(`decode ${f.string}`, (t) => {
    t.plan(1)
    t.same(bip173.decode(f.string, f.limit), {
      prefix: f.prefix.toLowerCase(),
      words: f.words
    })
  })

  tape(`fails for ${f.string} with 1 bit flipped`, (t) => {
    t.plan(1)

    let buffer = Buffer.from(f.string, 'utf8')
    buffer[f.string.lastIndexOf('1') + 1] ^= 0x1 // flip a bit, after the prefix
    let string = buffer.toString('utf8')
    t.throws(function () {
      bip173.decode(string, f.limit)
    }, new RegExp('Invalid checksum|Unknown character'))
  })
})

fixtures.bip173.invalid.forEach((f) => {
  if (f.prefix !== undefined && f.words !== undefined) {
    tape(`encode fails with (${f.exception})`, (t) => {
      t.plan(1)

      t.throws(function () {
        bip173.encode(f.prefix, f.words)
      }, new RegExp(f.exception))
    })
  }

  if (f.string !== undefined || f.stringHex) {
    let string = f.string || Buffer.from(f.stringHex, 'hex').toString('binary')

    tape(`decode fails for ${string} (${f.exception})`, (t) => {
      t.plan(1)
      t.throws(function () {
        bip173.decode(string)
      }, new RegExp(f.exception))
    })
  }
})

fixtures.fromWords.invalid.forEach((f) => {
  tape(`fromWords fails with ${f.exception}`, (t) => {
    t.plan(1)
    t.throws(function () {
      bip173.fromWords(f.words)
    }, new RegExp(f.exception))
  })
})
