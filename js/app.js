// Настройка <<холста>>
const canvas = document.getElementById("canvas");
canvas.width = 1280;
canvas.height = 620;
const ctx = canvas.getContext("2d");

let blockSize = 20;

if (window.innerWidth <= 1080) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	blockSize = 10;
}

// Получаем ширину и высоту элемента canvas
const width = canvas.width;
const height = canvas.height;

// Вычесляем ширину и высоту в ячейках
const widthInBlocks = Math.floor( width / blockSize );
const heightInBlocks = Math.floor( height / blockSize );

// Устанавливаем счет и рекорд в 0
let score = 0;
let record = 0;

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
	ctx.fillStyle = "white";
	ctx.textAlign = "left";
	ctx.fillText("Счет: " + score, blockSize + 15, blockSize + 30);
};

// Выводим рекорд игры в правом верхнем углу
const drawRecord = function () {
	ctx.font = "20px Courier";
	ctx.fillStyle = "white";
	ctx.textAlign = "right";
	ctx.fillText("Рекорд: " + record, width - 30, blockSize + 30);
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
	let centerX = this.col * blockSize + blockSize / 2;
	let centerY = this.row * blockSize + blockSize / 2;
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
		new Block(5, 9),
		new Block(5, 8),
		new Block(5, 7)
	];

	this.direction = "down";
	this.nextDirection = "down";
};

// Рисуем квадратик для каждого сегмента тела змейки
Snake.prototype.draw = function () {
	for (let i = 0; i < this.segments.length; i++) {
		this.segments[i].drawSquare("lime");
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
	if (this.selfCollision(newHead)) {
		animationTime = 100;
		score = 0;
		snake.segments = [
			new Block(5, 9),
			new Block(5, 8),
			new Block(5, 7)
		];

		this.direction = "down";
		this.nextDirection = "down";
		return;
	}

	// teleports
	if (head.row === 0) {				// top
		head.row = heightInBlocks - 2;
		return;
	}
	if (head.col === 0) {				// left
		head.col = widthInBlocks - 2;
		return;
	}
	if (head.col === widthInBlocks - 1) {// right
		head.col = 1;
		return;
	}
	if (head.row === heightInBlocks - 1) {// bottom
		head.row = 1;
		return;
	}

	this.segments.unshift(newHead);

	if (newHead.equal(apple.position)) {
		animationTime -= 1;
		apple.move(this.segments);
		if (score === record) {
			record++;
		}
		score++;
		return;
	}
	this.segments.pop();
};

// Проверяем, не столкнулась ли змейка со стеной или с собственным
// телом
Snake.prototype.selfCollision = function (head) {
	let selfCollision = false;

	for (let i = 0; i < this.segments.length; i++) {
		if (head.equal(this.segments[i])) {
			selfCollision = true;
		}
	}
	return selfCollision;
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
	this.position = new Block(blockSize, blockSize);
};

// Рисуем кружок в позиции яблока
Apple.prototype.draw = function () {
	this.position.drawCircle("red");
};

// Перемещаем яблоко в случайную позицию
Apple.prototype.move = function (occupiedBlocks) {
	var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
	var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
	this.position = new Block(randomCol, randomRow);

	// Проверяем, не находиться ли яблоко в блоке где уже расположена змейка
	for (let i = 0; i < occupiedBlocks.length; i++) {
		if (this.position.equal(occupiedBlocks[i])) {
			this.move(occupiedBlocks); // Вызываем метод move еще раз
			return;
		}
	}
};

// Создаем объект-змейку и объект-яблоко
const snake = new Snake();
const apple = new Apple();

let animationTime = 100;
const gameLoop = function () {
	ctx.clearRect(0, 0, width, height);
	drawScore();
	drawRecord();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();
	setTimeout(gameLoop, animationTime);
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

// Обрабатываем тач-события для работы на мобильных телефонах
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