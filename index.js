(function() {
function init() {
  // cache some DOM elements
  var startBtn = document.getElementById('start');
  var pauseBtn = document.getElementById('pause');
  var scoreEl = document.getElementById('score');

  // initialize variables from canvas element
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var height = canvas.height;
  var width = canvas.width;
  if (width > height) {
    height = canvas.height = width;
    console.log("Increased height to: " + height);
  } else if (width < height) {
    width = canvas.width = height;
    console.log("Increased width to: " + width);
  }

  // game settings
  var borderSize = 2;
  var borderColor = 'gray';
  var sqDefaultColor = 'green';
  var snakeColor = 'orange';
  var fruitColor = 'red';
  var squaresPerSide = 20;
  var squareLength = Math.floor(width / squaresPerSide);

  // game variables
  var speed;
  var score;
  var direction;
  const directions = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight'
  };
  var snakeHead = getCenterCoords();
  var fruitLocation = getRandomLocation();
  var snakeCoords = [snakeHead];

  // create the game representation
  var game = new Array(squaresPerSide);

  resetGame();
  drawGameBoard();
  initEventListeners();

  var raf; // for the animation of the canvas element
  var timeCounter = 0;

  function getCenterCoords() {
    return {
      x: Math.floor(squaresPerSide / 2),
      y: Math.floor(squaresPerSide / 2)
    };
  }

  function getRandomLocation() {
    return {
      x: Math.floor(Math.random() * squaresPerSide),
      y: Math.floor(Math.random() * squaresPerSide)
    };
  }

  function resetGame() {
    stopAnimation();
    speed = 1;
    score = 0;
    direction = directions.up;
    snakeHead = getCenterCoords();
    fruitLocation = getRandomLocation();
    snakeCoords = [snakeHead];

    // game squares of value 0 = empty, 1 = snake, 2 = fruit
    for (let i = 0; i < game.length; i++) {
      let arr = new Array(squaresPerSide);
      arr.fill(0);
      game[i] = arr;
    }
    game[snakeHead.x][snakeHead.y] = 1;
    game[fruitLocation.x][fruitLocation.y] = 2;
  }

  function initEventListeners() {
    window.addEventListener('keydown', (e) => {
      e.preventDefault(); // stop from scrolling
      //console.log("KEY: " + e.key);
      if (e.key == 'p') {
        if (pauseBtn.disabled) {
          startBtn.dispatchEvent(new MouseEvent('click'));
        } else {
          pauseBtn.dispatchEvent(new MouseEvent('click'));
        }
      } else if (e.key == 's') {
        startBtn.dispatchEvent(new MouseEvent('click'));
      }
      switch (e.key) {
        case directions.down: direction = directions.down; break;
        case directions.up: direction = directions.up; break;
        case directions.right: direction = directions.right; break;
        case directions.left: direction = directions.left; break;
      }
    });

    // once the game is initially drawn, set the event listeners
    startBtn.onclick = function(evt) {
      evt.target.disabled = !evt.target.disabled;
      pauseBtn.disabled = false;
      raf = window.requestAnimationFrame(moveAndDraw);
    }

    pauseBtn.onclick = function(evt) {
      evt.target.disabled = !evt.target.disabled;
      startBtn.disabled = false;
      window.cancelAnimationFrame(raf);
    }
  }

  function stopAnimation() {
    window.cancelAnimationFrame(raf);
  }

  function moveAndDraw() {
    //console.log("Time: ", timeCounter);
    if (Math.floor(60 / (++timeCounter * speed)) == 1) { // only update the state every few frames, depending on speed
      //console.log("Snake coordinates: ", snakeCoords);
      updateGameState();
      timeCounter = 0;
    }
    drawGameBoard();
    raf = window.requestAnimationFrame(moveAndDraw);
  }

  function updateGameState() {
    // update score
    score += timeCounter;
    scoreEl.textContent = score + " points";
    // calculate the next cell for the snake's head to occupy
    let nextCell = Object.assign({}, snakeHead);
    if (direction == directions.up) {
      nextCell.y -= 1; // y is decremented because lower indexes are at the "top" of the board
    } else if (direction == directions.down) {
      nextCell.y += 1; // similarly, "down" means to increment the y index
    } else if (direction == directions.left) {
      nextCell.x -= 1;
    } else if (direction == directions.right) {
      nextCell.x += 1;
    }

    // detect wall collisions
    if (nextCell.x+1 > squaresPerSide || nextCell.y+1 > squaresPerSide || nextCell.x < 0 || nextCell.y < 0) {
      alert('Collision with the wall! Game Over!');
      resetGame();
    }

    // detect tail collisions
    for (position of snakeCoords) {
      if (position.x == nextCell.x && position.y == nextCell.y) {
        alert('Collision with snake tail detected! Game Over!');
        resetGame();
      }
    }

    snakeHead = nextCell;
    snakeCoords.push(snakeHead);

    // detect eating of fruit
    if (nextCell.x == fruitLocation.x && nextCell.y == fruitLocation.y) { // ate fruit!
      // add extra snake length by NOT removing last snake tail coordinate
      // generate new fruit location NOT within the tail of the snake
      do {
        fruitLocation = {
          x: Math.floor(Math.random() * squaresPerSide),
          y: Math.floor(Math.random() * squaresPerSide)
        };
      } while(snakeCoords.filter(c => c.x === fruitLocation.x && c.y === fruitLocation.y) > 0);
      // increase speed
      speed++;
    } else { // didn't eat fruit
      if (!(snakeCoords.length <= 2)) {
        snakeCoords.shift(); // keep the snake "moving" by removing from the tail
      }
    }

    // empty all slots by default
    for (let i = 0; i < game.length; i++) {
      for (let j = 0; j < game[i].length; j++) {
        game[i][j] = 0;
      }
    }
    // add snake and fruit coords to game board
    for (let coord of snakeCoords) {
      game[coord.x][coord.y] = 1;
    }
    game[fruitLocation.x][fruitLocation.y] = 2;
  }

  function drawGameBoard() {
    // set background
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = sqDefaultColor;
    ctx.fillRect(0,0,width,height);

    // draw cell borders
    ctx.fillStyle = borderColor;
    for (let i = 0; i < game.length; i++) {
      ctx.fillRect(squareLength * i, 0, borderSize, height);
      ctx.fillRect(0, squareLength * i, width, borderSize);
    }

    // draw squares
    for (let i = 0; i < game.length; i++) {
      let row = game[i];
      for (let j = 0; j < row.length; j++) {
        if (row[j] == 1) { // SNAKE!
          //console.log('snake at: [' + i + ',' + j + ']');
          drawSquare(i, j, snakeColor);
        } else if (row[j] == 2) { // FRUIT!
          //console.log('fruit at: [' + i + ',' + j + ']');
          drawSquare(i, j, fruitColor);
        }
      }
    }
  }

  /**
  Draws a square on the board at the given coordinates of the given color
  */
  function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    let xPos = squareLength * x;
    let yPos = squareLength * y;
    ctx.fillRect(xPos + borderSize, yPos + borderSize, squareLength - borderSize, squareLength - borderSize);
  }
}

window.onload = init;
})();
