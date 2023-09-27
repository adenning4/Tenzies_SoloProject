import React from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

export default function App() {
  const [dice, setDice] = React.useState(allNewDice());
  const [tenzies, setTenzies] = React.useState(false);
  const [internalRollCount, setInternalRollCount] = React.useState(0);
  const [userRollCount, setUserRollCount] = React.useState(0);
  const [rolling, setRolling] = React.useState(false);
  const [rollSpeed, setRollSpeed] = React.useState(20);
  const [timer, setTimer] = React.useState({
    running: false,
    time: 0,
  });
  const [bestTime, setBestTime] = React.useState(
    JSON.parse(localStorage.getItem("tenziesBestTime"))
  );

  // Check winning condition
  React.useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);
    if (allHeld && allSameValue) {
      setTenzies(true);
      setTimer((prevTimer) => ({
        ...prevTimer,
        running: false,
      }));
      updateBestTime();
    }
  }, [dice]);

  // Simulate dice roll effect
  React.useEffect(() => {
    if (rolling) {
      if (internalRollCount >= 15) {
        setInternalRollCount(0);
        setRolling(false);
        setRollSpeed(20);
        return;
      }
      const id = setTimeout(() => {
        setInternalRollCount(
          (prevInternalRollCount) => prevInternalRollCount + 1
        );
        setRollSpeed((prevRollSpeed) => prevRollSpeed + 7);
      }, rollSpeed);
      rollDice();
      return () => clearInterval(id);
    }
  }, [internalRollCount, rolling]);

  //timer
  React.useEffect(() => {
    if (timer.running) {
      const id = setTimeout(() => {
        setTimer((prevTimer) => ({
          ...prevTimer,
          time: prevTimer.time + 1,
        }));
      }, 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  function rollDice() {
    if (!timer.running) {
      setTimer((prevTimer) => ({
        ...prevTimer,
        running: true,
      }));
    }
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.isHeld ? die : generateNewDie();
      })
    );
  }

  function callRollDice() {
    if (!tenzies) {
      setUserRollCount((prevUserRollCount) => prevUserRollCount + 1);
      setRolling(true);
    } else {
      setTenzies(false);
      setTimer({
        running: false,
        time: 0,
      });
      setDice(allNewDice());
      setUserRollCount(0);
    }
  }

  function holdDice(id) {
    if (timer.running) {
      setDice((oldDice) =>
        oldDice.map((die) => {
          return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
        })
      );
    }
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;

    if (seconds < 10) {
      return `${minutes}:0${seconds}`;
    } else {
      return `${minutes}:${seconds}`;
    }
  }

  function updateBestTime() {
    if (!bestTime) {
      setBestTime(timer.time);
      localStorage.setItem("tenziesBestTime", JSON.stringify(timer.time));
    } else {
      if (timer.time < bestTime) {
        setBestTime(timer.time);
        localStorage.setItem("tenziesBestTime", JSON.stringify(timer.time));
      }
    }
  }

  function getButtonText() {
    if (tenzies) {
      return "New Game";
    } else {
      if (timer.running) {
        return "Roll";
      } else {
        return "Start";
      }
    }
  }

  const diceElements = dice.map((die) => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
      running={timer.running}
    />
  ));

  return (
    <main>
      {tenzies && <Confetti />}
      <h1 className="title">Tenzies</h1>
      <p className="instructions">
        Roll until all dice are the same. Click each die to freeze it at its
        current value between rolls.
      </p>
      <div className="dice-container">{diceElements}</div>
      <div className="stats">
        <div className="statsTime">
          <p>Best Time: {bestTime ? formatTime(bestTime) : "---"}</p>
          <p>Time: {formatTime(timer.time)}</p>
        </div>
        <p>Rolls: {userRollCount}</p>
      </div>
      <button className="roll-dice" onClick={callRollDice}>
        {getButtonText()}
      </button>
    </main>
  );
}
