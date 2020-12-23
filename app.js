document.addEventListener('DOMContentLoaded', game);

function game() {
  //Grab major elements
  const startForm = document.querySelector('.start-form');
  const startBtn = document.getElementById('start');
  const gameContainer = document.getElementById('game-container');
  const gameBoard = document.querySelector('.game');
  const bombSpan = document.getElementById('bombs');
  const flagSpan = document.getElementById('flags');
  
  //Determine max-width depending on viewport
  const gameBoardSize = window.innerWidth > 400 ? '400px' : `${window.innerWidth}px`;
  gameContainer.style.maxWidth = gameBoardSize;
  gameContainer.style.minHeight = gameBoardSize;
  gameBoard.style.maxHeight = gameBoardSize;

  //Game state variables
  let squareWidth = 10;
  let bombs;
  let flags = 0;
  let isGameOver = false;

  const gameSquares = [];

  //do not start game until difficulty determined
  startBtn.addEventListener('click', () => {
    //Set starting properties
    difficulty = parseInt(document.querySelector('input[name="difficulty"]:checked').value);
    bombs = difficulty;
    startForm.classList.toggle('hide');
    gameContainer.classList.toggle('hide');
    gameContainer.style.display = 'flex';
    gameContainer.style.flexDirection = 'column';
    gameContainer.style.justifyContent = 'space-around';
    gameContainer.style.alignItems = 'center';
    bombSpan.textContent = bombs;
    flagSpan.textContent = bombs;

    //Create empty board to prevent game over on first click
    for (let i = 0; i < squareWidth * squareWidth; i++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.style.width = `${gameContainer.clientWidth / squareWidth}px`;
      square.style.height = `${gameContainer.clientWidth / squareWidth}px`;
      square.setAttribute('id', i);
      gameBoard.appendChild(square);
      gameSquares.push(square);
    }
    
    for (let i = 0; i < gameSquares.length; i++) {
      gameSquares[i].addEventListener('click', startGame);
    }
  });

  //function to start game on click and remove event listener
  function startGame(e) {
    this.classList.add('startingSquare');
    if (this.classList.contains('startingSquare')) {
      for (let i = 0; i < gameSquares.length; i++) {
        gameSquares[i].removeEventListener('click', startGame);
      }
      createBoard(bombs, this);
    }
  };

  //function to create game board
  function createBoard(bombs, firstSquare) {
    //Get index of clicked first square
    const clickedSquare = firstSquare.id;
    //create shuffled array of bombs vs valid moves
    const bombSquares = Array(bombs).fill('bomb');
    const validSquares = Array(squareWidth * squareWidth - bombs - 1).fill('valid');
    const combinedSquares = [...bombSquares, ...validSquares];
    const shuffledSquares = combinedSquares.sort(() => Math.random() - 0.5);
    //add clicked square to shuffled array
    shuffledSquares.splice(clickedSquare, 0, 'valid');
    

    //Run click function with firstSquare
    

    //create and append game squares to game board
    //square size is dependent on size of gameboard
    //Add corresponding class to shuffledSquares array
    for (let i = 0; i < gameSquares.length; i++) {
      const square = gameSquares[i];
      
      square.classList.add(shuffledSquares[i]);


      square.addEventListener('click', e => {
        const xPos = e.pageX;
        const yPos = e.pageY;
        const action = document.querySelector('input[name="action"]:checked').value;

        if (action === "check") {
          click(square, xPos, yPos);
        } else if (action === "flag") {
          addFlag(square);
        }
      });


      square.oncontextmenu = function(e) {
        e.preventDefault();
        addFlag(square);
      }
    }

    //Get totals for squares touching bombs
    for (let i = 0; i < gameSquares.length; i++) {
      //determine if square is on left/right edge of game board
      const leftEdge = i % squareWidth === 0 ;
      const rightEdge = i % squareWidth === squareWidth - 1;

      let total = 0;

      //series of conditionals to check if square is bordering a bomb
      if (gameSquares[i].classList.contains('valid')) {
        if (i > 0 && !leftEdge && gameSquares[i - 1].classList.contains('bomb')) total++;
        if (i > 9 && !rightEdge && gameSquares[i + 1 - squareWidth].classList.contains('bomb')) total++;
        if (i > 10 && gameSquares[i - squareWidth].classList.contains('bomb')) total++;
        if (i > 11 && !leftEdge && gameSquares[i - 1 - squareWidth].classList.contains('bomb')) total++;
        if (i < 98 && !rightEdge && gameSquares[i + 1].classList.contains('bomb')) total++;
        if (i < 90 && !leftEdge && gameSquares[i - 1 + squareWidth].classList.contains('bomb')) total++;
        if (i < 88 && !rightEdge && gameSquares[i + 1 + squareWidth].classList.contains('bomb')) total++;
        if (i < 89 && gameSquares[i + squareWidth].classList.contains('bomb')) total++;
        //corner cases for squares 0 and 99
        if ((i == 10 || i == 11) && gameSquares[0].classList.contains('bomb')) total++;
        if ((i == 89 || i == 88 || i == 98) && gameSquares[99].classList.contains('bomb')) total++;
        //Add total to current square
        gameSquares[i].setAttribute('data', total);
      }
    }

    //Click function runs with firstSquare passed from initial click
    click(firstSquare);
  }

  //add flag for right click
  function addFlag(square) {
    if (isGameOver) return;
    //Code will not affect 'checked' squares
    if (!square.classList.contains('checked')) {
      if (!square.classList.contains('flag')) {
        //Do not allow more flags than bombs
        if (flags < bombs) {
          square.classList.add('flag');
          square.innerHTML = '&#128681';
          flagSpan.textContent = parseInt(flagSpan.textContent) - 1;
          flags++;
          checkForWin();
        }
      } else {
        square.classList.remove('flag');
        square.innerHTML = '';
        flagSpan.textContent = parseInt(flagSpan.textContent) + 1;
        flags--;
      }
    } 
  }

  //logic for click events
  function click(square, xPos, yPos) {
    let currentId = square.id;

    //check status of square clicked
    if (isGameOver) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;
    if (square.classList.contains('bomb')) {
      gameOver(square, xPos, yPos);
    } else {
      let total = parseInt(square.getAttribute('data'));
      if (total === 0) {
        square.classList.add('empty');
      }
      //Style checked boxes based on number value
      if (total != 0) {
        square.classList.add('checked');
        square.innerHTML = total;
        if (total === 1) square.style.backgroundColor = '#f00';
        if (total === 2) square.style.backgroundColor = '#0f0';
        if (total === 3) square.style.backgroundColor = '#00f';
        if (total === 4) { 
          square.style.backgroundColor = '#ff0';
          square.style.color = '#000';
        }
        if (total === 5) {
          square.style.backgroundColor = '#0ff';
          square.style.color = '#000';
        }
        if (total === 6) square.style.backgroundColor = '#f0f';
        if (total === 7) square.style.backgroundColor = '#f93';
        if (total === 8) square.style.backgroundColor = '#680';
        return;
      }
      checkSquare(square, currentId);
    }
    square.classList.add('checked');
  }

  //Check neighboring squares and implement 'fill' effect if consecutive empty squares
  function checkSquare(square, currentId) {
    const leftEdge = currentId % squareWidth === 0;
    const rightEdge = currentId % squareWidth === squareWidth - 1;

    //Recursion to identify neighboring cells
    setTimeout(()=> {
      if (currentId > 0 && !leftEdge) {
        const newId = gameSquares[parseInt(currentId) - 1].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 9 && !rightEdge) {
        const newId = gameSquares[parseInt(currentId) + 1 - squareWidth].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 10) {
        const newId = gameSquares[parseInt(currentId) - squareWidth].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 11 && !leftEdge) {
        const newId = gameSquares[parseInt(currentId) - 1 - squareWidth].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 98 && !rightEdge) {
        const newId = gameSquares[parseInt(currentId) + 1].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 90 && !leftEdge) {
        const newId = gameSquares[parseInt(currentId) - 1 + squareWidth].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 88 && !rightEdge) {
        const newId = gameSquares[parseInt(currentId) + 1 + squareWidth].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 89) {
        const newId = gameSquares[parseInt(currentId) + squareWidth].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      } 
      //Corner cases for squares 0 and 99
      if (currentId == 10) {
        const newId = gameSquares[parseInt(currentId) - 10].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId == 89) {
        const newId = gameSquares[parseInt(currentId) + 10].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId == 98) {
        const newId = gameSquares[parseInt(currentId) + 1].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
    }, 40)
  }

  function gameOver(square, xPos, yPos) {
    const gameOverFlash = document.querySelector('.game-over-flash');
    const gameInfo = document.querySelector('.game-info-container');
    const gameOverInfo = document.querySelector('.game-over');
    const gameOverBtn = document.querySelector('.restart');
    gameOverFlash.style.left = (xPos - 6) + "px";
    gameOverFlash.style.top = (yPos - 6) + "px";
    gameOverFlash.style.transition = 'transform 400ms ease-out, opacity 300ms ease-out, background-color 300ms ease-in-out 100ms';
    gameOverFlash.style.backgroundColor = '#d40';
    gameOverFlash.style.transform = 'scale(10)';
    setTimeout(() => {
      gameOverFlash.style.opacity = '0';
    }, 400);

    setTimeout(() => {
      gameOverFlash.style.display = 'none';
      gameInfo.classList.toggle('hide');
      gameOverInfo.classList.toggle('hide');
      gameOverBtn.addEventListener('click', () => {
        location.reload();
      });
    }, 401);

    isGameOver = true;

    gameSquares.forEach(square => {
      setTimeout(() => {
        if (square.classList.contains('bomb')) {
          square.innerHTML = '&#128163;';
        }
      }, 400);
    })
  }

  //check flags for matching bombs
  function checkForWin() {
    const gameInfo = document.querySelector('.game-info-container');
    const gameOverInfo = document.querySelector('.game-over');
    const gameOverInfoText = document.querySelector('.game-over p');
    const gameOverBtn = document.querySelector('.restart');
    let matches = 0;
    for (let i = 0; i < gameSquares.length; i++) {
      if (gameSquares[i].classList.contains('flag') && gameSquares[i].classList.contains('bomb')) {
        matches++;
      }
      if (matches === bombs) {
        isGameOver = true;
        gameInfo.classList.toggle('hide');
        gameOverInfoText.textContent = 'No Mercy! You Win!';
        gameOverInfo.classList.toggle('hide');
        gameOverBtn.addEventListener('click', () => {
          location.reload();
        });
        return;
      }
    }
  }
}