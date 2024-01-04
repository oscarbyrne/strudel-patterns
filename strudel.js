/*
TODO:
- make API for SP
- add a "force midi" setting if it's broken
- add program changes to electribe API
- add CC controls to electribe API
- reconsider duo
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
function duo(pattern) {
  return pattern.withValue(
    (value) => parseInt(value, 12)
  )
}
const MIDI_DEVICE_NAME = 'UM-ONE MIDI 1'
let electribe = {
  parts: {},  
  addPart: function(partName, midiChannel, portableSoundName) {
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
