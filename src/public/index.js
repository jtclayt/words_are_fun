"use strict";
(function() {
  // Apparently this is what the pros do.
  window.addEventListener('load', init);

  // Just some game params maybe someday it will use an API
  let currentGuess;
  let wordId;
  let currentGuessNumber;
  let gameGrid;
  const KEYS = {
    Backspace: 8, Enter: 13, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74,
    K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87,
    X: 88, Y: 89, Z: 90
  };
  const KEYBOARD_LAYOUT = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Enter"],
    ["Z", "X", "C", "V", "B", "N", "M", "Backspace"]
  ]

  /** Does the setup things. */
  function init() {
    getNewWord();
    currentGuessNumber = 1;
    currentGuess = "";
    gameGrid = [];
    document.onkeydown = getLetterListener;
    resetGameBoard();
    resetKeyBoard();
  }

  /** Get this party started. */
  function resetGameBoard() {
    const gameBoard = id("gameboard");

    while (gameBoard.firstChild) {
      gameBoard.removeChild(gameBoard.firstChild);
    }

    for (let row = 0; row < 6; row++) {
      const currentRow = createRow();
      gameGrid.push([]);

      for (let col = 0; col < 5; col++) {
        const block = createBlock();
        gameGrid[row].push(block);
        currentRow.append(block);
      }

      gameBoard.append(currentRow);
    }
  }

  /**
   * This seems optimum.
   * @returns A rectangle for all your blocks.
   */
  function createRow() {
    const row = gen("section");
    row.classList.add("row");
    return row;
  }

  /**
   * Puts a bunch of p tags for each row, for game board.
   * @returns Not actually a block.
   */
  function createBlock() {
    const block = gen("p");
    block.classList.add("block");
    return block;
  }

  /**
   * Creates a button for the visual keyboard.
   * @param {*} keyCode The keycode for the button (matches standard keyboard).
   * @param {*} key The key to display on keyboard.
   * @returns The new button.
   */
  function createKeyboardKey(keyCode, key) {
    const keyButton = gen("button");
    keyButton.textContent = key;
    keyButton.classList.add("keyboard-button");
    keyButton.setAttribute("id", `key-${key}`);
    keyButton.addEventListener("click", () => processLetterInput(keyCode, key));
    return keyButton;
  }

  /** Reset the keyboard for a new game */
  function resetKeyBoard() {
    const keyboard = id("keyboard");

    while (keyboard.firstChild) {
      keyboard.removeChild(keyboard.firstChild);
    }

    KEYBOARD_LAYOUT.forEach(keyboardRow => {
      const currentRow = createRow();
      keyboardRow.forEach(key => {
        const currentKeyButton = createKeyboardKey(KEYS[key], key);
        currentRow.append(currentKeyButton);
      });
      keyboard.append(currentRow);
    });
  }

  /**
   * It definitely knows the alphabet.
   * @param {event} e When stuff happens.
   */
  function getLetterListener(e) {
    processLetterInput(e.keyCode, e.key);
  }

  function processLetterInput(keyCode, key) {
    if (keyCode >= KEYS.A && keyCode <= KEYS.Z) {
      if (currentGuess.length < 5) {
        gameGrid[currentGuessNumber - 1][currentGuess.length].textContent = key.toUpperCase();
        currentGuess += key.toLowerCase();
      }
    } else if (keyCode === KEYS.Enter) {
      if (currentGuess.length == 5) {
        submitWord();
      }
    } else if (keyCode === KEYS.Backspace) {
      if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, currentGuess.length - 1);
        gameGrid[currentGuessNumber - 1][currentGuess.length].textContent = "";
      }
    }
  }

  /** Thinks pretty hard about words and stuff. */
  function submitWord() {
    fetch("/check_word", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({wordId: wordId, guess: currentGuess})
    }).then(checkStatus)
      .then(res => res.json())
      .then(data => parseResult(data.result)).catch(handleError);
  }

  /**
   * We are in the endgame now.
   * @param {boolean} isWinner Wowie you could be a winner.
   */
  function onEndGame(isWinner) {
    document.onkeydown = () => {};

    setTimeout(() => {
      if (isWinner) {
        alert("congrats");
      } else {
        alert("you suck")
      }
    }, 500)

    setTimeout(() => {
      init();
    }, 2000)
  }

  /** Pull a new word from the API. */
  function getNewWord() {
    fetch("/new_word")
      .then(checkStatus)
      .then(res => res.json())
      .then(data => {
        wordId = data.wordId;
      }).catch(handleError);
  }

  /**
   * Process the results from API and display result for each letter.
   * @param {list} resultArray The results from API.
   */
  function parseResult(resultArray) {
    let isGuessCorrect = true;

    resultArray.forEach((letterResult, index) => {
      const letterButton = id(`key-${currentGuess[index].toUpperCase()}`);
      switch (letterResult) {
        case "g":
          letterButton.classList.remove("warning");
          letterButton.classList.add("success");
          gameGrid[currentGuessNumber-1][index].classList.add("success");
          break;
        case "y":
          if (!letterButton.classList.contains("success")) {
            letterButton.classList.add("warning");
          }
          isGuessCorrect = false;
          gameGrid[currentGuessNumber-1][index].classList.add("warning");
          break;
        default:
          if (!letterButton.classList.contains("success")) {
            letterButton.classList.add("unavailable");
          }
          isGuessCorrect = false;
      }
    });

    if (isGuessCorrect || currentGuessNumber === 6) {
      onEndGame(isGuessCorrect);
    }

    currentGuessNumber++;
    currentGuess = "";
  }

  /**
   * Check whether fetch returned a status of 200 OK, throw an error if not.
   * @param {object} response - The response object from the API for the GET request.
   * @returns {object} Returns the response if ok, otherwise throws error.
   */
   function checkStatus(response) {
    if (response.ok) {
      return response;
    }
    throw Error("Error in request: " + response.statusText);
  }

  /** This should probably do something */
  function handleError(error) {
    console.log(error);
  }

  /**
   * Returns the a newly created DOM element of given tag.
   * @param {string} tagName - HTML tag to be created.
   * @returns {object} - DOM object of new element.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} elId - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(elId) {
    return document.getElementById(elId);
  }
}());
