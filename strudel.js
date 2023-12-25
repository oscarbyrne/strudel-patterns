/*
TODO:
- roll diatonic stuff into sequencer
- rewrite diatonic stuff using the strudel functions (squeeze etc)
- allow to also send cc numbers

/*
-----------------------------------------------------------------
SEQUENCER
-----------------------------------------------------------------
*/
function part(channel, palette, soundName, pattern) {
  return note(
    squeeze(pattern, palette)
  ).midichan(channel).sound(soundName)
}
function section(composition) {
  let parts = []
  for (const [partName, pattern] of Object.entries(composition)) {
    const [channel, palette, sound] = partsMeta[partName]
    parts.push(
      part(channel, palette, sound, pattern)
    )
  }
  return stack(...parts)
}
function song(arrangement, bpm, midi=null) {
  let arranged = arrange(
    ...arrangement
  ).cpm(bpm)
  if (midi != null) {
    arranged = arranged.midi(midi)
  }
  return arranged
}
/*
-----------------------------------------------------------------
DIATONIC
-----------------------------------------------------------------
*/
function maximallyEvenSet(c, d, a = 0) {
  if (d == 0) {
    throw new Error("Zero division")
  }
  let maximallyEven = []
  for (let k = 0; k < d; k++) {
    maximallyEven.push(
      Math.floor((k * c + a) / d)
    )
  }
  return maximallyEven
}
function diatonicSubset(mode, cardinality, basis = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
  const mapping = maximallyEvenSet(
    basis.length,
    cardinality,
    mode
  )
  let diatonic = []
  for (let i = 0; i < mapping.length; i++) {
    diatonic.push(
      basis[mapping[i]]
    )
  }
  return diatonic
}
function octaved(mode) {
  if (mode.length > 10) {
    throw new Error("Too many pitch classes for decimal basis")
  }
  let pitches = []
  // 128 notes in midi standard
  let nOctaves = Math.ceil(128 / mode.length)
  let offset = 0
  for (let octave = 0; octave < nOctaves ; octave++) {
    for (let i = 0; i < 10; i++) {
      let value
      if (i < mode.length) {
        value = pitch(octave, mode[i])
      } else {
        value = "~"
      }
      pitches.push(value)
    }
  }
  return pitches
}
function pitch(octave, pitchClass) {
  return (12 * octave) + pitchClass
}
function chord(octave, degree, relIntervals, mode) {
  let notes = []
  for (let i = 0; i < relIntervals.length ; i++) {
    const interval = relIntervals[i] + degree
    const relOctave = Math.floor(interval / mode.length)
    const intervalClass = interval % mode.length
    notes.push(
      pitch(
        octave + relOctave,
        mode[intervalClass]
      )
    )
  }
  return notes
}
