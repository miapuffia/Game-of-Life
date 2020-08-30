// get canvas related references
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - $('#controlPanel').outerHeight(true);

var WIDTH = canvas.width;
var HEIGHT = canvas.height;

//Set constants
const gridSize = 30;
const gridMargin = 2;

var grid = [];

var numXSquares;
var numYSquares;
var excessX;
var excessY;

var runningId;

//Get reference constants
const slider = $('#slider');

const startButton = $("#start");
const nextButton = $("#next");
const clearButton = $("#clear");
const rulesButton = $("#rules");

// listen for mouse events
canvas.onmousedown = myDown;
window.addEventListener('resize', myResize);

//Listeners
slider.on("input", function() { //Ideally, I would be able to change speed while stepping, but I can't figure it out so the slider will be disabled while stepping
});

startButton.click(function() {
	if(this.innerHTML == "Start") {
		this.innerHTML = "Stop";
		
		slider.prop("disabled", true);
		nextButton.prop("disabled", true);
		
		stepRunner();
	} else {
		clearInterval(runningId);
		
		this.innerHTML = "Start";
		
		slider.prop("disabled", false);
		nextButton.prop("disabled", false);
	}
});

nextButton.click(function() {
	step();
});

clearButton.click(function() {
	clearInterval(runningId);
	
	startButton.innerHTML = "Start";
	
	slider.prop("disabled", false);
	nextButton.prop("disabled", false);
	
	setupGrid();
	draw();
});

rulesButton.click(function() {
	alert("Game of Life rules:\n\n\u2022 Any live cell with less than 2 live neighbors dies, as if by underpopulation.\n\u2022 Any live cell with 2 or 3 live neighbours lives on to the next generation.\n\u2022 Any live cell with more than 3 live neighbours dies, as if by overpopulation.\n\u2022 Any dead cell with exactly 3 live neighbours becomes a live cell, as if by reproduction.");
});

calculateGrid();
setupGrid();
draw();

function draw() {
	clear();
	
	drawGrid();
}

function setupGrid() {
	grid = [];
	
	for(let i = 0; i < numXSquares; i++) {
		grid.push([]);
		
		for(let j = 0; j < numYSquares; j++) {
			grid[i].push(false);
		}
	}
}

function calculateGrid() {
	//I use parseInt here to convert to int
	numXSquares = parseInt((WIDTH - gridMargin) / (gridSize + gridMargin));
	numYSquares = parseInt((HEIGHT - gridMargin) / (gridSize + gridMargin));
	
	excessX = (WIDTH - gridMargin) % (numXSquares * (gridSize + gridMargin));
	excessY = (HEIGHT - gridMargin) % (numYSquares * (gridSize + gridMargin));
}

function drawGrid() {
	for(let i = 0; i < numXSquares; i++) {
		for(let j = 0; j < numYSquares; j++) {
			let x = parseInt((excessX / 2) + (i * (gridSize + gridMargin)) + gridMargin, 10);
			let y = parseInt((excessY / 2) + (j * (gridSize + gridMargin)) + gridMargin, 10);
			
			drawSquare(x, y, (grid[i][j] ? "gold" : "gray"));
		}
	}
}

function drawLine(x1, y1, x2, y2, color) {
	ctx.strokeStyle = color;
	ctx.lineWidth = allLineStrokeWidth;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, gridSize, gridSize);
}

//Slow, shouldn't be called in a loop
function drawSquareIndeces(indexX, indexY) {
	let absoluteX = parseInt((excessX / 2) + (indexX * (gridSize + gridMargin)) + gridMargin, 10);
	let absoluteY = parseInt((excessY / 2) + (indexY * (gridSize + gridMargin)) + gridMargin, 10);
	
	drawSquare(absoluteX, absoluteY, (grid[indexX][indexY] ? "gold" : "gray"));
}

// clear the canvas
function clear() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// handle mousedown events
function myDown(e){
	// tell the browser we're handling this mouse event
	e.preventDefault();
	e.stopPropagation();
	
	// get the current mouse position
	var mx = parseInt(e.clientX);
	var my = parseInt(e.clientY);
	
	let indexX = parseInt((mx - (excessX / 2) - gridMargin) / (gridSize + gridMargin));
	let indexY = parseInt((my - (excessY / 2) - gridMargin) / (gridSize + gridMargin));
	
	if(indexX >= grid.length) {
		grid.length;
		
		indexX = grid.length - 1;
	}
	
	if(indexY >= grid[0].length) {
		grid[0].length;
		
		indexY = grid[0].length - 1;
	}
	
	grid[indexX][indexY] = !grid[indexX][indexY];
	
	drawSquareIndeces(indexX, indexY);
}

function myResize(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - $('#controlPanel').outerHeight(true);
	
	WIDTH = canvas.width;
	HEIGHT = canvas.height;
	
	calculateGrid();
	setupGrid();
	draw();
}

function getNumNeighbors(x, y) {
	let numNeightbors = 0;
	
	if(
		x < 0
		|| x > numXSquares
		|| y < 0
		|| y > numYSquares
	) {
		return 0;
	}
	
	//top left
	if(
		x > 0
		&& y > 0
		&& grid[x - 1][y - 1] === true
	) {
		numNeightbors++;
	}
	
	//top
	if(
		y > 0
		&& grid[x][y - 1] === true
	) {
		numNeightbors++;
	}
	
	//top right
	if(
		x < numXSquares - 1
		&& y > 0
		&& grid[x + 1][y - 1] === true
	) {
		numNeightbors++;
	}
	
	//right
	if(
		x < numXSquares - 1
		&& grid[x + 1][y] === true
	) {
		numNeightbors++;
	}
	
	//bottom right
	if(
		x < numXSquares - 1
		&& y < numYSquares - 1
		&& grid[x + 1][y + 1] === true
	) {
		numNeightbors++;
	}
	
	//bottom
	if(
		y < numYSquares - 1
		&& grid[x][y + 1] === true
	) {
		numNeightbors++;
	}
	
	//bottom left
	if(
		x > 0
		&& y < numYSquares - 1
		&& grid[x - 1][y + 1] === true
	) {
		numNeightbors++;
	}
	
	//left
	if(
		x > 0
		&& grid[x - 1][y] === true
	) {
		numNeightbors++;
	}
	
	return numNeightbors;
}

function step() {
	let newGrid = [];
	
	for(let i = 0; i < numXSquares; i++) {
		newGrid.push([]);
		
		for(let j = 0; j < numYSquares; j++) {
			let numNeighbors = getNumNeighbors(i, j);
			
			if(grid[i][j] === true) {
				if(numNeighbors === 2 || numNeighbors === 3) {
					newGrid[i][j] = true;
				} else {
					newGrid[i][j] = false;
				}
			} else {
				if(numNeighbors === 3) {
					newGrid[i][j] = true;
				} else {
					newGrid[i][j] = false;
				}
			}
		}
	}
	
	grid = newGrid;
	
	draw();
}

function stepRunner() {
	runningId = window.setInterval(step, slider[0].value);
}