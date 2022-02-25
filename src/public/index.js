"use strict";
(function() {
  // Apparently this is what the pros do.
  window.addEventListener('load', init);

  // Just some game params maybe someday it will use an API
  let currentGuess;
  let sessionId;
  let currentGuessNumber;
  let gameGrid;
  const KEYS = {
    Backspace: 8, Enter: 13, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74,
    K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87,
    X: 88, Y: 89, Z: 90
  };
  const KEYBOARD_LAYOUT = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
    ["Backspace", "Enter"]
  ]

  /** Does the setup things. */
  function init(_, isReset=false) {
    sessionId = localStorage.getItem("sessionId");
    currentGuessNumber = 1;
    currentGuess = "";
    gameGrid = [];
    document.onkeydown = getLetterListener;
    resetGameBoard();
    resetKeyBoard();

    if (sessionId && !isReset) {
      getSessionData();
    } else {
      getNewWord();
    }
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
    updateRowBorders();
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
    block.classList.add("inactive-border");
    return block;
  }

  /**
   * Creates a button for the visual keyboard.
   * @param {number} keyCode The keycode for the button (matches standard keyboard).
   * @param {string} key The key to display on keyboard.
   * @returns The new button.
   */
  function createKeyboardKey(keyCode, key) {
    const keyButton = gen("button");
    keyButton.textContent = key;
    keyButton.classList.add("keyboard-button");
    keyButton.classList.add("gray");
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

  /**
   * Process the input of a keycode and a key
   * @param {number} keyCode The keycode for the button (matches standard keyboard).
   * @param {string} key The key to display on keyboard.
   */
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
    fetch(`/sessions/${sessionId}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({guess: currentGuess})
    }).then(checkStatus)
      .then(res => res.json())
      .then(data => {
        parseResult(data.result);
        if (data.isGameOver) {
          onEndGame(data.isWin, data.word);
        }
      }).catch(handleError);
  }

  /**
   * We are in the endgame now.
   * @param {boolean} isWinner Wowie you could be a winner.
   * @param {string} word The real word.
   */
  function onEndGame(isWinner, word) {
    document.onkeydown = () => {};

    setTimeout(() => {
      if (isWinner) {
        alert(`Nice you got it in ${currentGuessNumber - 1} guesses`);
      } else {
        alert(`Aww, you didn't get it. The word was ${word}.`);
      }
    }, 500)

    setTimeout(() => {
      init(null, true);
    }, 2000)
  }

  /** Load session data for the user and process previous guesses */
  function getSessionData() {
    fetch(`/sessions/${sessionId}`)
        .then(checkStatus)
        .then(res => res.json())
        .then(data => {
          if (data.guesses) {
            data.guesses.split(",").forEach(previousGuess => {
              const [word, result] = previousGuess.split(":");
              word.toUpperCase().split("").forEach(letter => {
                processLetterInput(KEYS[letter], letter);
              });
              parseResult(result.split(""));
              currentGuess = "";
            });
          }
          if (currentGuessNumber >= 6) {
            getNewWord();
          }
        }).catch(handleGetSessionError);
  }

  /** Pull a new word from the API. */
  function getNewWord() {
    if (sessionId) {
      fetch(`/sessions/${sessionId}/reset`, {method: "POST"})
        .then(checkStatus)
        .then(res => res.json())
        .then(data => {
          if (!data.reset) {
            resetSession();
          }
        }).catch(handleError);
    } else {
      fetch("/sessions", {method: "POST"})
        .then(checkStatus)
        .then(res => res.json())
        .then(data => {
          localStorage.setItem("sessionId", data.sessionId);
          sessionId = data.sessionId;
        }).catch(handleError);
    }
  }

  /** Clear the session id and retrieve new */
  function resetSession() {
    sessionId = null;
    localStorage.removeItem("sessionId");
    getNewWord();
  }

  /**
   * Process the results from API and display result for each letter.
   * @param {list} resultArray The results from API.
   */
  function parseResult(resultArray) {
    resultArray.forEach((letterResult, index) => {
      const letterButton = id(`key-${currentGuess[index].toUpperCase()}`);
      switch (letterResult) {
        case "g":
          letterButton.classList.remove("gray");
          letterButton.classList.remove("dark-gray");
          letterButton.classList.remove("yellow");
          letterButton.classList.add("green");
          gameGrid[currentGuessNumber-1][index].classList.add("green");
          break;
        case "y":
          if (!letterButton.classList.contains("green")) {
            letterButton.classList.remove("gray");
            letterButton.classList.remove("dark-gray");
            letterButton.classList.add("yellow");
          }
          gameGrid[currentGuessNumber-1][index].classList.add("yellow");
          break;
        default:
          if (!letterButton.classList.contains("green") && !letterButton.classList.contains("yellow")) {
            letterButton.classList.remove("gray");
            letterButton.classList.add("dark-gray");
          }
      }
    });

    currentGuessNumber++;
    updateRowBorders();
    currentGuess = "";
  }

  /** Update the row borders. */
  function updateRowBorders() {
    if (currentGuessNumber === 1) {
      // First row is being set active
      gameGrid[currentGuessNumber-1].forEach(toggleBlockBorder);
    } else {
      // all other rows
      gameGrid[currentGuessNumber-2].forEach(toggleBlockBorder);

      if (currentGuessNumber < 6) {
        // If not last row, don't set next row active
        gameGrid[currentGuessNumber-1].forEach(toggleBlockBorder);
      }
    }
  }

  /**
   * Toggle a blocks border light/dark.
   * @param {object} block HTML element for the block.
   */
  function toggleBlockBorder(block) {
    block.classList.toggle("active-border");
    block.classList.toggle("inactive-border");
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

  /** When error occurs retrieving session data */
  function handleGetSessionError() {
    resetSession();
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
