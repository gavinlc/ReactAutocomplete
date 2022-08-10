import "./styles.css";
import { useState } from "react";
const possibleValues = [
  "Apple",
  "Apricot",
  "Banana",
  "Carrot",
  "Coconut",
  "Mango",
  "Turnip"
];

// Ao / Apple -> 1 error -> Matches Apple
// Ap / Apple -> 0 errors -> Matches Apple
// Aii / Apple -> 2 errors -> No match
// Appk / Apple -> 1 error -> Matches Apple
// Mabg / Mango -> 1 error -> Matches Mango

export default function App() {
  const [value, setValue] = useState("");
  const [matchedValues, setMatchedValues] = useState([]);

  const handleOnChange = (e) => {
    const { value } = e.target;
    const matched = possibleValues.filter((possibleValue) =>
      matchWithError(value, possibleValue)
    );

    setValue(value);
    setMatchedValues(matched);
  };

  const matchWithError = (value, possible) => {
    const valueLower = value.toLowerCase();
    const possibleLower = possible.toLowerCase();

    if (possibleLower.startsWith(valueLower)) return true;
    const valueLetters = valueLower.split("");
    const possibleLetters = possibleLower.split("");

    let numberOfMatchingLetters = 0;

    valueLetters.forEach((letter, idx) => {
      if (letter === possibleLetters[idx]) {
        numberOfMatchingLetters++;
      }
    });

    return numberOfMatchingLetters >= value.length - 1;
  };

  const handlePossibleSelect = (e, value) => {
    setValue(value);
    setMatchedValues([]);
  };

  return (
    <div className="App">
      <div className="container">
        <input onChange={handleOnChange} value={value} />
        <div className="suggestions">
          {matchedValues.map((match) => {
            return (
              <p
                key={`match-${match}`}
                onClick={(e) => handlePossibleSelect(e, match)}
              >
                {match}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
