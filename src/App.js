import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

const exercises = {
  scales: {
    easy: ['C Major', 'G Major', 'D Major', 'A Minor'],
    medium: ['E Major', 'B Major', 'F# Minor', 'C# Minor'],
    hard: ['F Major', 'Bb Major', 'Eb Major', 'Ab Minor'],
  },
  arpeggios: {
    easy: ['C Major Arpeggio', 'G Major Arpeggio'],
    medium: ['D Major Arpeggio', 'A Minor Arpeggio'],
    hard: ['E Major Arpeggio', 'B Minor Arpeggio'],
  },
  chords: {
    easy: ['C Major Chord', 'G Major Chord'],
    medium: ['D7 Chord', 'A7 Chord'],
    hard: ['Fmaj7 Chord', 'Bm7b5 Chord'],
  },
};

const categories = Object.keys(exercises);
const difficulties = ['easy', 'medium', 'hard'];

function App() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulties[0]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [bpm, setBpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const metronomeRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    // Initialize metronome with Tone.js
    const synth = new Tone.MembraneSynth().toDestination();
    const loop = new Tone.Loop((time) => {
      synth.triggerAttackRelease('C2', '8n', time);
    }, '4n');
    metronomeRef.current = { synth, loop };
    Tone.Transport.bpm.value = bpm;

    return () => {
      Tone.Transport.stop();
      loop.stop();
      metronomeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (metronomeRef.current) {
      Tone.Transport.bpm.rampTo(bpm, 0.1);
    }
  }, [bpm]);

  useEffect(() => {
    if (timerRunning) {
      // Start timer logic here if needed
    } else {
      // Stop timer logic here if needed
    }
  }, [timerRunning]);

  function toggleMetronome() {
    if (!isPlaying) {
      Tone.start().then(() => {
        metronomeRef.current.loop.start(0);
        Tone.Transport.start();
        setIsPlaying(true);
      });
    } else {
      metronomeRef.current.loop.stop();
      Tone.Transport.stop();
      setIsPlaying(false);
    }
  }

  function getRandomExercise(category, difficulty) {
    const list = exercises[category][difficulty];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  function proceedWithExercise() {
    const exercise = getRandomExercise(selectedCategory, selectedDifficulty);
    setCurrentExercise(exercise);
    setTimerRunning(true);
  }

  function getCountdownThenStartExercise() {
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownIntervalRef.current);
          setCountdown(null);
          proceedWithExercise();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <div className="app-container">
      <h1>Drum Practice App</h1>
      <div className="selectors">
        <label>
          Category:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulty:
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={getCountdownThenStartExercise} disabled={timerRunning || countdown !== null}>
        Start Exercise
      </button>

      {countdown !== null && (
        <div className="countdown-overlay">
          <h2>{countdown}</h2>
        </div>
      )}

      <div className="frog-container">
        <img src="frog.png" alt="Frog" />
      </div>

      <div className="current-exercise">
        <h2>Current Exercise:</h2>
        <p>{currentExercise || 'None'}</p>
      </div>

      <div className="metronome-controls">
        <label>
          BPM: {bpm}
          <input
            type="range"
            min="40"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
        </label>
        <button onClick={toggleMetronome}>{isPlaying ? 'Stop Metronome' : 'Start Metronome'}</button>
      </div>
    </div>
  );
}

export default App;