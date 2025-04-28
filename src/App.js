import "./App.css";
import React, { useState, useEffect } from "react";
import { Button, Slider, Card, CardContent } from "./components/ui";
import * as Tone from "tone";


const DrumPracticeApp = () => {
  const [selectedPracticeTime, setSelectedPracticeTime] = useState(900); // Default to 15 minutes
const [practiceTimeLeft, setPracticeTimeLeft] = useState(900);
const [practiceTimerRunning, setPracticeTimerRunning] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Fluidity");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");
  const [currentExercise, setCurrentExercise] = useState(null);
  const [bpm, setBPM] = useState(Math.floor(Math.random() * (160 - 60 + 1)) + 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const metronome = new Tone.NoiseSynth({
    noise: {
      type: "white", // White noise mimics a shaker
    },
    envelope: {
      attack: 0.001, // Fast attack
      decay: 0.1, // Short decay for a crisp sound
      sustain: 0,
    },
  }).toDestination();
  const [selectedTime, setSelectedTime] = useState(5 * 60); // Default to 5 minutes
  const toggleMetronome = async () => {
    if (!isPlaying) {
      await Tone.start();
      Tone.Transport.bpm.value = bpm;
  
      Tone.Transport.scheduleRepeat((time) => {
        metronome.triggerAttackRelease("8n", time); // Uses 8th note duration for a crisp sound
      }, "4n");
  
      Tone.Transport.start();
    } else {
      Tone.Transport.stop();
    }
  
    setIsPlaying(!isPlaying);
  };

//Overall timer useEffect below
  useEffect(() => {
    if (practiceTimerRunning && practiceTimeLeft > 0) {
      const practiceTimer = setInterval(() => {
        setPracticeTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
  
      return () => clearInterval(practiceTimer);
    } else if (practiceTimeLeft === 0) {
      stopPracticeSession(); // ✅ Stop everything when the practice timer ends
    }
  }, [practiceTimerRunning, practiceTimeLeft]);

//Interval Timer use Effect below
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // Decrease by 1 second
  
      return () => clearInterval(timer); // Cleanup interval when component updates
    } else if (timeLeft === 0) {
      getRandomExercise(); // When timer reaches 0, select a new exercise
    }
  }, [timerRunning, timeLeft]);

  useEffect(() => {
    fetch("/exercises.json")
      .then((response) => response.json())
      .then((data) => setExercises(data))
      .catch((error) => console.error("Error loading exercises:", error));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      Tone.Transport.bpm.value = bpm; // ✅ Updates BPM while playing
    }
  }, [bpm, isPlaying]);

  const getRandomExercise = () => {
    const filteredExercises = exercises.filter(
      (ex) =>
        ex.category === selectedCategory &&
        (selectedDifficulty === "Any" || ex.difficulty === selectedDifficulty)
    );
  
    if (filteredExercises.length > 0) {
      setCurrentExercise(filteredExercises[Math.floor(Math.random() * filteredExercises.length)]);
      setBPM(Math.floor(Math.random() * (140 - 80 + 1)) + 80); // ✅ Update BPM only
      setTimeLeft(selectedTime); // ✅ Reset Timer
      setTimerRunning(true); // ✅ Keep timer running
  
      // ✅ Only start metronome if it’s not already playing
      if (!isPlaying) {
        toggleMetronome();
      }
    } else {
      setCurrentExercise(null);
    }
  };

  return (
    <div className="app-container">
      <div style={{ textAlign: "center", paddingTop: "20px" }}>
        <img src="/images/frog-drummer.png" alt="Frog Drummer" className="bouncing-frog" style={{ width: "200px" }} />
      </div>
      <h1 className="text-2xl font-bold">Drum Practice App</h1>

      <div>
  <label>Select Category:</label>
  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
    <option value="Fluidity">Fluidity</option>
    <option value="Independence">Independence</option>
    <option value="Vocabulary">Vocabulary</option>
    <option value="Time">Time</option>
  </select>
</div>

      <div>
        <label>Difficulty:</label>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
          <option value="Any">Any</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div>
  <h2>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</h2>
</div>
<div>
<div>
  <label>Select Total Practice Time: </label>
  <select value={selectedPracticeTime} onChange={(e) => setSelectedPracticeTime(Number(e.target.value))}>
    <option value={300}>5 minutes</option>
    <option value={900}>15 minutes</option>
    <option value={1800}>30 minutes</option>
  </select>
</div>
  <label>Select Time Interval: </label>
  <select value={selectedTime} onChange={(e) => setSelectedTime(Number(e.target.value))}>
    {[...Array(10).keys()].map((i) => (
      <option key={i + 1} value={(i + 1) * 60}>
        {i + 1} minute{i > 0 ? "s" : ""}
      </option>
    ))}
  </select>
</div>
      <Button onClick={getRandomExercise}>Start Practice</Button>

      {currentExercise && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold">{currentExercise.text}</h2>
            <img src={currentExercise.image} alt={currentExercise.text} className="mx-auto" />
          </CardContent>
        </Card>
      )}

      <div>
        <h2>Metronome</h2>
        <p>BPM: {bpm}</p>
        <Slider value={bpm} min={80} max={150} onChange={setBPM} />
        <Button onClick={toggleMetronome}>
  {isPlaying ? "Stop Metronome" : "Start Metronome"}
</Button>
      </div>
    </div>
  );
};

export default DrumPracticeApp;