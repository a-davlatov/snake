// Настройка <<холста>>
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const wrapper = document.getElementById("wrapper");
let blockSize = 10;
if (window.innerWidth <= 1080) {
	wrapper.style.width = window.innerWidth + 'px';
	wrapper.style.height = window.innerHeight + 'px';
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	blockSize = 45;
}

// Получаем ширину и высоту элемента canvas
const width = canvas.width;
const height = canvas.height;

// Вычесляем ширину и высоту в ячейках
const widthInBlocks = Math.floor( width / blockSize );
const heightInBlocks = Math.floor( height / blockSize );

// Устанавливаем счет в 0
let score = 0;

// Рисуем рамку
const drawBorder = function () {
	ctx.fillStyle = "gray";
	ctx.fillRect(0, 0, width, blockSize);
	ctx.fillRect(0, height - blockSize, width, blockSize);
	ctx.fillRect(0, 0, blockSize, height);
	ctx.fillRect(width - blockSize, 0, blockSize, height);
};

// Выводим счет игры в левом верхнем углу
const drawScore = function () {
	ctx.font = "20px Courier";
	ctx.fillStyle = "black";
	ctx.textAlign = "left";
	ctx.fillText("Счет: " + score, blockSize + 15, blockSize + 30);
};

// Отменяем действие setInterval и печатаем сообщение <<Game Over>>
const gameOver = function () {
	playing = false;
	ctx.font = "60px Courier";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseLine = "middle";
	ctx.fillText("Game Over", width / 2, height / 2);
};

// Рисуем окружность
const circle = function (x, y, radius, fillCircle) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);

	if (fillCircle) {
		ctx.fill();
	} else {
		ctx.stroke();
	}
};

// Задаем конструктор Block (ячейка)
const Block = function (col, row) {
	this.col = col;
	this.row = row;
};

// Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function (color) {
	var x = this.col * blockSize;
	var y = this.row * blockSize;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, blockSize, blockSize);
};

// Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function (color) {
	var centerX = this.col * blockSize + blockSize / 2;
	var centerY = this.row * blockSize + blockSize / 2;
	ctx.fillStyle = color;
	circle(centerX, centerY, blockSize / 2, true);
};

// Проверяем, находится ли эта ячейка в той же позиции, что и ячейка
// otherBlock
Block.prototype.equal = function (otherBlock) {
	return this.col === otherBlock.col && this.row === otherBlock.row;
};

// Задаем конструктор Snake (змейка)
const Snake = function () {
	this.segments = [
		new Block(7, 5),
		new Block(6, 5),
		new Block(5, 5)
	];

	this.direction = "right";
	this.nextDirection = "right";
};

// Рисуем квадратик для каждого сегмента тела змейки
Snake.prototype.draw = function () {
	for (var i = 0; i < this.segments.length; i++) {
		if (i % 2 === 0) {
			this.segments[i].drawSquare("turquoise");
		} else {
			this.segments[i].drawSquare("lightblue");
		}
	}
};

// Создаем новую голову и добавляем ее к началу змейки,
// чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function () {
	let head = this.segments[0];
	let newHead;

	this.direction = this.nextDirection;

	if (this.direction === "right") {
		newHead = new Block(head.col + 1, head.row);
	} else if (this.direction === "down") {
		newHead = new Block(head.col, head.row + 1);
	} else if (this.direction === "left") {
		newHead = new Block(head.col - 1, head.row);
	} else if (this.direction === "up") {
		newHead = new Block(head.col, head.row - 1);
	}
	if (this.checkCollision(newHead)) {
		gameOver();
		return;
	}

	this.segments.unshift(newHead);

	if (newHead.equal(apple.position)) {
		animationTime -= 2;
		apple.move(this.segments);
		score++;
	} else {
		this.segments.pop();
	}
};

// Проверяем, не столкнулась ли змейка со стеной или собственным
// телом
Snake.prototype.checkCollision = function (head) {
	let leftCollision = (head.col === 0);
	let topCollision = (head.row === 0);
	let rightCollision = (head.col === widthInBlocks - 1);
	let bottomCollision = (head.row === heightInBlocks - 1);

	let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

	let selfCollision = false;

	for (let i = 0; i < this.segments.length; i++) {
		if (head.equal(this.segments[i])) {
			selfCollision = true;
		}
	}
	return wallCollision || selfCollision;
};

// Задаем следующее направление движения змейки на основе нажатой
// клавиши
Snake.prototype.setDirections = function (newDirection) {
	if (this.direction === "up" && newDirection === "down") {
		return;
	} else if (this.direction === "right" && newDirection === "left") {
		return;
	} else if (this.direction === "down" && newDirection === "up") {
		return;
	} else if (this.direction === "left" && newDirection === "right") {
		return;
	}
	this.nextDirection = newDirection;
};

// Задаем конструктор Apple (яблоко)
const Apple = function () {
	this.position = new Block(10, 10);
};

// Рисуем кружок в позиции яблока
Apple.prototype.draw = function () {
	this.position.drawCircle("palegreen");
};

// Перемещаем яблоко в случайную позицию
Apple.prototype.move = function (occupiedBlocks) {
	var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
	var randomRow = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
	this.position = new Block(randomCol, randomRow);

	// Check to see if apple has been moved to a block currently occupied by the snake
	for (var i = 0; i < occupiedBlocks.length; i++) {
		if (this.position.equal(occupiedBlocks[i])) {
			this.move(occupiedBlocks); // Call the move method again
			return;
		}
	}
};

// Создаем объект-змейку и объект-яблоко
const snake = new Snake();
const apple = new Apple();

let playing = true;
let animationTime = 100;
const gameLoop = function () {
	ctx.clearRect(0, 0, width, height);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();
	if (playing) {
		setTimeout(gameLoop, animationTime);
	}
};
gameLoop();

// Преобразуем коды клавиш в направления
const directions = {
	37: "left",
	38: "up",
	39: "right",
	40: "down"
};

// Задаем обработчик события keydown (клавиши-стрелки)
$("body").keydown(function (event) {
	let newDirection = directions[event.keyCode];
	if (newDirection !== undefined) {
		snake.setDirections(newDirection);
	}
});

// Обрабатываем тач-события для работы на мобильных приложениях
$('#canvas').swipe( {
    swipeStatus:function(event, phase, direction, distance, duration, fingerCount, fingerData, currentDirection)
    {
    	if (phase=="end"){ 
	    	if (direction !== undefined) {
				snake.setDirections(direction);
			}
		}
 },
 triggerOnTouchEnd:false,
 threshold:20 // сработает через 20 пикселей
});