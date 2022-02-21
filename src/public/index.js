"use strict";
(function() {
  // Apparently this is what the pros do.
  window.addEventListener('load', init);

  // Just some game params maybe someday it will use an API
  let currentGuess;
  let wordId;
  let currentGuessNumber;
  let grid;

  /** Does the setup things. */
  function init() {
    getNewWord();
    currentGuessNumber = 1;
    currentGuess = "";
    grid = [];
    document.onkeydown = getLetterListener;
    resetGameBoard();
  }

  /** Get this party started. */
  function resetGameBoard() {
    const gameBoard = id("gameboard");

    while (gameBoard.firstChild) {
      gameBoard.removeChild(gameBoard.firstChild);
    }

    for (let row = 0; row < 6; row++) {
      const currentRow = createRow();
      grid.push([]);

      for (let col = 0; col < 5; col++) {
        const block = createBlock();
        grid[row].push(block);
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
   * Probably could just be CSS.
   * @returns Not actually a block.
   */
  function createBlock() {
    const block = gen("p");
    block.classList.add("block");
    return block;
  }

  /**
   * It definitely knows the alphabet.
   * @param {event} e When stuff happens.
   */
  function getLetterListener(e) {
    if (e.keyCode >= 65 && e.keyCode <= 90) {
      if (currentGuess.length < 5) {
        grid[currentGuessNumber - 1][currentGuess.length].textContent = e.key.toUpperCase();
        currentGuess += e.key;
      }
    } else if (e.keyCode === 13) {
      if (currentGuess.length == 5) {
        submitWord();
      }
    } else if (e.keyCode === 8) {
      if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, currentGuess.length - 1);
        grid[currentGuessNumber - 1][currentGuess.length].textContent = "";
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

  function getNewWord() {
    fetch("/new_word")
      .then(checkStatus)
      .then(res => res.json())
      .then(data => {
        wordId = data.wordId;
      }).catch(handleError);
  }

  function parseResult(resultArray) {
    let isGuessCorrect = true;

    resultArray.forEach((letterResult, index) => {
      switch (letterResult) {
        case "g":
          grid[currentGuessNumber-1][index].classList.add("success");
          break;
        case "y":
          isGuessCorrect = false;
          grid[currentGuessNumber-1][index].classList.add("warning");
          break;
        default:
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
