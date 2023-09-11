import { drawGrid, toGridPos, PIXEL_RATIO } from "./Utils.js";

export class SpriteSheetContainer {
	canvas = document.querySelector("#spritesheetCanvas");
	context = this.canvas.getContext("2d", { alpha: false });
	canvasElOffsetLeft = 0;
	canvasElOffsetTop = 0;
	canvasCenterX = 0;
	canvasCenterY = 0;
	image = null;
	width;
	height;
	gridSize;
	scale = 0.3;
	onSelected = null;
	onImageLoaded = null;
	selectedTile = {};
	cursor = {
		x: 0,
		y: 0,
		rightPressed: false,
		visible: false,
		pressed: false,
		inMap: false
	};

	constructor(gridSize = 32) {
		this.canvas.onmousemove = this.onCanvasMouseMove.bind(this);
		this.canvas.onmouseout = this.onCanvasMouseOut.bind(this);
		this.canvas.onwheel = this.onCanvasWheel.bind(this);
		this.canvas.onclick = this.onCanvasClick.bind(this);
		this.canvas.imageSmoothingEnabled = false;
		
		this.canvas.onmouseenter = () => this.cursor.visible = true;
		
		this.gridSize = gridSize;
		
		this.updateCanvas();
	}

	onCanvasMouseMove(ev) {
		const scale = this.scale;
		const gridSize = this.gridSize;

		const offsetX = this.canvasCenterX - ( this.image.width * scale / 2 );
		const offsetY = this.canvasCenterY - ( this.image.height * scale / 2 );
		
		let cursorX = ev.x - this.canvasElOffsetLeft - offsetX;
		let cursorY = ev.y - this.canvasElOffsetTop - offsetY;
		
		this.cursor.x = toGridPos(cursorX, gridSize, scale);
		this.cursor.y = toGridPos(cursorY, gridSize, scale);
		this.cursor.rightPressed = ev.buttons === 2;
		this.cursor.pressed = ev.buttons === 1;

		this.updateCanvas();
	}

	onCanvasWheel(ev) {
		this.scale += ev.deltaY * -0.001;
		this.scale = Math.min(Math.max(this.scale, 0.3), 1.5);

		this.onCanvasMouseMove(ev);
	}

	onCanvasMouseOut() {
		this.cursor.visible = false;
		
		this.updateCanvas();
	}

	onCanvasClick() {
		if(this.onSelected === null) return;
		
		const cursorX = this.cursor.x;
		const cursorY = this.cursor.y;
		
		this.selectedTile.x = cursorX;
		this.selectedTile.y = cursorY;
		
		this.onSelected({
			x: cursorX,
			y: cursorY
		});
		
		this.updateCanvas();
	}

	/**
	 * @param {Image} img
	 *
	*/
	setSpriteImage(img) {
		this.image = img;
		
		const container = document.querySelector(".spritesheet-block");
		
		// const width = Math.max(this.image.width, container.clientWidth);
		// const height = Math.max(this.image.height, container.clientHeight);
		
		const width = container.clientWidth;
		const height = container.clientHeight;
		
		this.canvas.width = width;// * PIXEL_RATIO;
		this.canvas.height = height;// * PIXEL_RATIO;
		
		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";
		
		const { left, top } = this.canvas.getBoundingClientRect();
		this.canvasElOffsetLeft = left;
		this.canvasElOffsetTop = top;
		
		this.canvasCenterX = this.canvas.width / 2;
		this.canvasCenterY = this.canvas.height / 2;
		
		if(this.onImageLoaded) this.onImageLoaded(this.image);
		
		this.updateCanvas();
	}

	loadFromUrl(url) {
		const img = new Image();
		img.onload = () => this.setSpriteImage(img);
		img.src = url;
	}

	drawCursor() {
		this.context.fillStyle = "rgba(255, 255, 255, 0.4)";
		this.context.fillRect(this.cursor.x, this.cursor.y,
														this.gridSize, this.gridSize);
	}

	updateCanvas() {
		requestAnimationFrame(this.drawCanvas.bind(this));
	}

	drawCanvas() {
		let width = this.canvas.width;
		let height = this.canvas.height;
		const scale = this.scale;
		
		this.context.clearRect(0, 0, width, height);
		this.context.save();

		// Move origin to center.
		this.context.translate(this.canvasCenterX, this.canvasCenterY);
		this.context.scale(scale, scale);
		
		if(this.image) {
			const imgHalfWidth = -this.image.width / 2;
			const imgHalfHeight = -this.image.height / 2;
			this.context.drawImage(this.image, imgHalfWidth, imgHalfHeight);

			this.context.save();
			this.context.translate(imgHalfWidth, imgHalfHeight);

			drawGrid(this.context, this.gridSize,
							 this.image.width, this.image.height, /* Draw border*/ false);
			
			if(this.cursor.visible) this.drawCursor();
		}
		
		if(this.selectedTile.x) {
			this.context.fillStyle = "rgba(200, 200, 200, 0.5)";
			this.context.fillRect(this.selectedTile.x, this.selectedTile.y, this.gridSize, this.gridSize);
		}
		
		this.context.restore(); // inner
		
		this.context.restore(); // outer
	}
}