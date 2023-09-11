import { Map } from "./Map.js";
import { drawGrid, toGridPos, PIXEL_RATIO } from "./Utils.js";

export class App {
	canvas = document.querySelector("#mapCanvas");
	context = this.canvas.getContext("2d", { alpha: false });
	mainEl = document.querySelector("main");
	map = new Map(this.context);
	canvasElOffsetLeft = 0;
	canvasElOffsetTop = 0;
	canvasXCenter = 0;
	canvasYCenter = 0;
	tile = null;
	cursor = {
		x: 0,
		y: 0,
		rightPressed: false,
		visible: false,
		pressed: false,
		inMap: false
	};

	constructor(map) {
		this.canvas.onmousemove = this.onCanvasMouseMove.bind(this);
		this.canvas.oncontextmenu = this.onCanvasClick.bind(this);
		this.canvas.onmouseout = this.onCanvasMouseOut.bind(this);
		this.canvas.onwheel = this.onCanvasWheel.bind(this);
		this.canvas.onclick = this.onCanvasClick.bind(this);
		this.context.imageSmoothingEnabled = false;
		
		this.canvas.onmouseenter = () => this.cursor.visible = true;
		
		this.context.fillStyle = "red";
		this.context.font = "16px Roboto";
		this.context.textBaseline = "middle";
	}

	resizeCanvas() {
		const main = document.querySelector("main");
		
		const width = Math.max(this.map.width, main.clientWidth - 1);
		const height = Math.max(this.map.height, main.clientHeight - 1);
		
		this.canvas.width = width * PIXEL_RATIO;
		this.canvas.height = height * PIXEL_RATIO;
		
		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";
		
		const { left, top } = this.canvas.getBoundingClientRect();
		this.canvasElOffsetLeft = left;
		this.canvasElOffsetTop = top;
		
		this.updateCanvas();
	}

	onCanvasWheel(ev) {
		// Prevent scroll.
		ev.preventDefault();
		
		this.map.scale = ev.deltaY * -0.001;
		
		this.onCanvasMouseMove(ev);
	}

	onCanvasMouseMove(ev) {
		const tileSize = this.map.tileSize;
		const scale = this.map.scale;
		
		const offsetX = this.mainEl.scrollLeft - this.canvasElOffsetLeft - this.canvasXCenter;
		const offsetY = this.mainEl.scrollTop - this.canvasElOffsetTop - this.canvasYCenter;
		const relX = ev.x * PIXEL_RATIO + offsetX;
		const relY = ev.y * PIXEL_RATIO + offsetY;

		this.cursor.inMap = this.map.isPosInMap(relX, relY);
		this.cursor.x = toGridPos(relX, tileSize, scale);
		this.cursor.y = toGridPos(relY, tileSize, scale);
		this.cursor.rightPressed = ev.buttons === 2;
		this.cursor.pressed = ev.buttons === 1;

		this.updateCanvas();
	}

	onCanvasMouseOut() {
		this.cursor.visible = false;
		
		this.updateCanvas();
	}

	onCanvasClick(ev) {
		// Prevent browser default,
		// right click menu for canvas element.
		ev.preventDefault();

		// 2 for right, 1 for left mouse click.
		this.onCanvasMouseMove({
			x: ev.x,
			y: ev.y,
			buttons: ev.buttons === 2 ? 2 : 1
		});
	}

	setTile(bitmap) {
		this.tile = bitmap;
	}

	updateCanvas() {
		requestAnimationFrame(this.drawCanvas.bind(this));
	}

	drawCursor() {
		const cursorX = this.cursor.x;
		const cursorY = this.cursor.y;
		const tileSize = this.map.tileSize;

		this.context.strokeStyle = "#BBB";
		this.context.strokeRect(cursorX, cursorY, tileSize, tileSize);
		
		if(this.tile) {
			this.context.save();
			this.context.globalAlpha = 0.5;
			
			this.context.drawImage(
				this.map.imageSource,
				this.tile.x, this.tile.y,
				tileSize, tileSize,
				cursorX, cursorY,
				tileSize, tileSize
			);
			
			this.context.restore();
		}
	}

	drawCanvas() {
		const scale = this.map.scale;
		const canvasWdth = this.canvas.width;
		const canvasHght = this.canvas.height;
		const mapWidth = this.map.width;
		const mapHeight = this.map.height;
		const tileSize = this.map.tileSize;
		this.canvasXCenter = (canvasWdth / 2) - mapWidth * scale / 2;
		this.canvasYCenter = (canvasHght / 2) - mapHeight * scale / 2;
		
		this.context.save();
		
		this.context.clearRect(0, 0, canvasWdth, canvasHght);
		this.context.translate(this.canvasXCenter, this.canvasYCenter);
		this.context.scale(scale, scale);
		
		this.onBeforeUpdate();

		this.map.draw();
		drawGrid(this.context, tileSize, mapWidth, mapHeight);
		
		if(this.cursor.visible) this.drawCursor();
		
		this.context.restore();
	}

	onBeforeUpdate() {
		if(!this.cursor.inMap) return;
		
		const tileIndex = this.map.getTileIndexByPos(this.cursor.x, this.cursor.y);
		
		if(this.cursor.pressed) {
			this.map.fillTileByIndex(tileIndex, this.tile);
		}
		
		if(this.cursor.rightPressed) {
			this.map.removeTileByIndex(tileIndex);
		}
	}
}