import "./App.css";
import React, { useState, useEffect } from "react";
import { Button, Slider, Card, CardContent } from "./components/ui";
import * as Tone from "tone";


const DrumPracticeApp = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Fluidity");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");
  const [currentExercise, setCurrentExercise] = useState(null);
  const [bpm, setBPM] = useState(Math.floor(Math.random() * (160 - 60 + 1)) + 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const metronome = new Tone.MembraneSynth().toDestination();  // Fetch exercises from JSON file
  const [selectedTime, setSelectedTime] = useState(5 * 60); // Default to 5 minutes
  const toggleMetronome = async () => {
    if (!isPlaying) {
      await Tone.start(); // Ensures the audio context is running
      Tone.Transport.bpm.value = bpm; // Set BPM
      Tone.Transport.scheduleRepeat((time) => {
        metronome.triggerAttackRelease("C2", "8n", time);
      }, "4n"); // Repeat every quarter note
      Tone.Transport.start();
    } else {
      Tone.Transport.stop();
    }
    setIsPlaying(!isPlaying);
  };

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

  const getRandomExercise = () => {
    const filteredExercises = exercises.filter(
      (ex) =>
        ex.category === selectedCategory &&
        (selectedDifficulty === "Any" || ex.difficulty === selectedDifficulty)
    );
  
    if (filteredExercises.length > 0) {
      setCurrentExercise(filteredExercises[Math.floor(Math.random() * filteredExercises.length)]);
      setBPM(Math.floor(Math.random() * (160 - 60 + 1)) + 60); // Random BPM
      setTimeLeft(selectedTime); //Refernces time selected in Timer dropdown selector
      setTimerRunning(true); // Start the timer
      toggleMetronome(); // ✅ Start the metronome when "Start Practice" is clicked
    } else {
      setCurrentExercise(null); // If no exercises match, clear the display
    }
  };

  return (
    <div className="app-container">
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
        <Slider value={bpm} min={60} max={160} onChange={setBPM} />
        <Button onClick={toggleMetronome}>
  {isPlaying ? "Stop Metronome" : "Start Metronome"}
</Button>
      </div>
    </div>
  );
};

export default DrumPracticeApp;