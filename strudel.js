/*
TODO:
- use error stack to get line number and add that as context to haps so that function is highlighted
- might as well highlight all functions that return a pattern (e.g. the basis functions)
- make API for SP
- add program changes to electribe API
- add CC controls to electribe API
*/
function transform(pattern, bases) {
  function query(state) {
    const basis = bases.query(state)
    let haps = []
    for (const hap of pattern.query(state)) {
      const other = basis.at(hap.value % basis.length)
      haps.push(
        new Hap(
          hap.whole,
          hap.part,
          other.value + 12 * Math.floor(hap.value / basis.length),
          hap.combineContext(other)
        )
      )
    }
    return haps
  }
  return new Pattern(query)
}
function maximallyEven(c, d, a) {
  let parts = []
  for (let k = 0; k < d; k++) {
    parts.push(
      pure(Math.floor((k * c + a) / d))
    )
  }
  return stack(...parts)
}
function toDecimal(pattern, radix) {
  return pattern.withValue(
    v => parseInt(v, radix)
  )
}

const T = transform
const ME = maximallyEven
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
const MIDI_DEVICE_NAME = 'UM-ONE MIDI 1'

let electribe = {
  parts: {},  
  addPart: function(partName, midiChannel, portableSoundName = null) {
    if (portableSoundName == null) {
      portableSoundName = partName
    }
    this.parts[partName] = [midiChannel, portableSoundName]
  },
  pattern: function(p) {
    let patterns = []
    for (const [partName, pattern] of Object.entries(p)) {
      const [midiChannel, portableSoundName] = this.parts[partName]
      patterns.push(
        pattern.note().midichan(midiChannel).sound(portableSoundName)
      )
    }
    let s = stack(...patterns)
    if (WebMidi.outputs.find(o => o.name == MIDI_DEVICE_NAME)) {
      return s.midi(MIDI_DEVICE_NAME)
    } else {
      return s
    }
  }
}

electribe.addPart('bd', 1)
electribe.addPart('sd', 2)
electribe.addPart('chords', 3, 'gm_acoustic_guitar_nylon')
electribe.addPart('bass', 4, 'gm_trombone')
electribe.addPart('vox', 7, 'gm_flute')
electribe.addPart('oh', 10)
electribe.addPart('hh', 11)
electribe.addPart('rim', 12)

electribe.pattern({
  chords: T(
    b7("<[04, 06, 11] [10 12 04 06]>").add(b7("[0, 2, 4, 10, 12, -20]")),
    cat(ME(12, 7, 5), ME(12, 7, 0)).slow(2)
  ).add(60)
})

// b12("0 1 2 3 4 5 6 7 8 9 A B").add(50).note()
