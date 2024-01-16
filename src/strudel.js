/*
TODO:
- documentation
- deploy to static site
- figure out d* operation for j function (need to track state)
- make API for SP
- add program changes to electribe API
- add CC controls to electribe API
- clean up code (add semicolons, switch to classes)
*/

function maximallyEvenSet(c, d, m) {
  return listRange(0, d-1).map(
    (k) => Math.floor((k * c + m) / d)
  )
}
function monotonize(pcs) {
  pcs = pcs.map((p) => p % 12)
  for (let i = 1; i < pcs.length; i++) {
    if (pcs[i] < pcs[i - 1]) {
      pcs[i] += 12
    }
  }
  return pcs
}
const customScale = register(
  'customScale',
  (list, pattern) => pattern.fmap(
    value => list.at(value%list.length) + Math.floor(value/list.length) * 12
  )
)
// See: https://mtosmt.org/issues/mto.19.25.2/mto.19.25.2.plotkin.html#:~:text=ABSTRACT%3A%20Filtered%20Point%2DSymmetry%20(,between%20iterated%20maximally%20even%20sets.
const j = register(
  'j',
  function(d, m, pattern) {
    m = Array.isArray(m) ? m : [m]
    let pcs = listRange(0, 11)
    for (let n = 0; n < d.length - 1; n++) {
      pcs = pcs.map(
        (k) =>
        maximallyEvenSet(
          d[n + 1],
          d[n],
          m[n]
        ).at(k % d[n])
      )
    }
    return pattern.customScale(
      monotonize(pcs)
    )
  }
)

function toDecimal(pattern, radix) {
  return pattern.withValue(
    v => parseInt(v, radix)
  )
}

const b2 = p => toDecimal(p, 2)
const b3 = p => toDecimal(p, 3)
const b4 = p => toDecimal(p, 4)
const b5 = p => toDecimal(p, 5)
const b6 = p => toDecimal(p, 6)
const b7 = p => toDecimal(p, 7)
const b8 = p => toDecimal(p, 8)
const b9 = p => toDecimal(p, 9)
const b10 = p => toDecimal(p, 10)
const b11 = p => toDecimal(p, 11)
const b12 = p => toDecimal(p, 12)

let output = {
  midi: {
    deviceName: 'UM-ONE MIDI 1',
    force: false,
    connected: function() {
      return Boolean(
        WebMidi.outputs.find(o => o.name == this.deviceName)
      )
    },
    send: function(pattern) {
      return pattern.midi(this.deviceName)
    },
  },
  send: function(pattern) {
    if (this.midi.connected()) {
      return this.midi.send(pattern)
    } else {
      return pattern
    }
  },
}
let electribe = {
  parts: {},  
  addPart: function(midiChannel, partName, portableSoundName = null) {
    if (portableSoundName == null) {
      portableSoundName = partName
    }
    this.parts[partName] = [midiChannel, portableSoundName]
  },
  part: function(partName, pattern) {
    const [midiChannel, portableSoundName] = this.parts[partName]
    return output.send(
      pattern.note().midichan(midiChannel).sound(portableSoundName)
    )
  },
  pattern: function(args) {
    let patterns = []
    for (const [partName, pattern] of Object.entries(args)) {
      patterns.push(
        this.part(partName, pattern)
      )
    }
    return stack(...patterns)
  },
}

electribe.addPart( 1, 'bd')
electribe.addPart( 2, 'sd')
electribe.addPart( 3, 'chords', 'gm_acoustic_guitar_nylon')
electribe.addPart( 4, 'bass', 'gm_trombone')
electribe.addPart( 7, 'vox', 'gm_flute')
electribe.addPart(10, 'oh')
electribe.addPart(11, 'hh')
electribe.addPart(12, 'rim')

electribe.pattern({
  chords: b7("<[04, 06, 11] [10 12 04 06]>").add(b7("[0, 2, 4, 10, 12, -20]")).j(
    "12:7", "<5 0> / 2"
  ).add(60)
})
