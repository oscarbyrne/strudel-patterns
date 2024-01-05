/*
TODO:
- make T update hap context with value of basis.length, then in minime use that as radix parameter in parseInt (default 12)
- make API for SP
- add program changes to electribe API
- add CC controls to electribe API
- write html controller to use minime by default and pass context
- put it on github
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
      Math.floor((k * c + a) / d)
    )
  }
  return parts
}

const T = transform
const ME = (c, d, a) => stack(...maximallyEven(c, d, a).map(pure))
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

function minime(string) {
  function transform(_, c, d, a) {
    const asArray = maximallyEven(
      Number(c),
      Number(d),
      Number(a)
    )
    return '[' + asArray.toString() + ']'
  }
  return mini(
    string.replace(
      /ME\((\d+)\,\s*(\d+)\,\s*(\d+)\)/g,
      transform
    )
  )
}
setStringParser(minime)

electribe.pattern({
  chords: T(
    "<[0 2 4] [0 2 4 6]>".add("<0 3>"),
    minime('<ME(12, 7, 5) ME(12, 7, 0)> / 2')
  ).add(60)
})
