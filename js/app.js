// Настройка <<холста>>
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

console.log(window.innerWidth);
const wrapper = document.getElementById("wrapper");
if (window.innerWidth <= 768) {
	console.log('mobile');

	wrapper.style.width = window.innerWidth + 'px';
	wrapper.style.height = window.innerHeight + 'px';
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

// Получаем ширину и высоту элемента canvas
var width = canvas.width;
var height = canvas.height;

// Вычесляем ширину и высоту в ячейках
var blockSize = 10;
var widthInBlocks = Math.floor( width / blockSize );
var heightInBlocks = Math.floor( height / blockSize );

// Устанавливаем счет в 0
var score = 0;

// Рисуем рамку
var drawBorder = function () {
	ctx.fillStyle = "gray";
	ctx.fillRect(0, 0, width, blockSize);
	ctx.fillRect(0, height - blockSize, width, blockSize);
	ctx.fillRect(0, 0, blockSize, height);
	ctx.fillRect(width - blockSize, 0, blockSize, height);
};

// Выводим счет игры в левом верхнем углу
var drawScore = function () {
	ctx.font = "20px Courier";
	ctx.fillStyle = "black";
	ctx.textAlign = "left";
	ctx.fillText("Счет: " + score, blockSize, blockSize + 15);
};

// Отменяем действие setInterval и печатаем сообщение <<Game Over>>
var gameOver = function () {
	playing = false;
	ctx.font = "60px Courier";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseLine = "middle";
	ctx.fillText("Game Over", width / 2, height / 2);
};

// Рисуем окружность
var circle = function (x, y, radius, fillCircle) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);

	if (fillCircle) {
		ctx.fill();
	} else {
		ctx.stroke();
	}
};

// Задаем конструктор Block (ячейка)
var Block = function (col, row) {
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
var Snake = function () {
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
	var head = this.segments[0];
	var newHead;

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
	var leftCollision = (head.col === 0);
	var topCollision = (head.row === 0);
	var rightCollision = (head.col === widthInBlocks - 1);
	var bottomCollision = (head.row === heightInBlocks - 1);

	var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

	var selfCollision = false;

	for (var i = 0; i < this.segments.length; i++) {
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
var Apple = function () {
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
var snake = new Snake();
var apple = new Apple();

var playing = true;
var animationTime = 100;
var gameLoop = function () {
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
var directions = {
	37: "left",
	38: "up",
	39: "right",
	40: "down"
};

// Задаем обработчик события keydown (клавиши-стрелки)
$("body").keydown(function (event) {
	var newDirection = directions[event.keyCode];
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