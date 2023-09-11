export class Map {
	layers = [];
	activeLayerIndex = 0;
	tileSize = 64;
	rows = 10;
	cols = 10;
	imageSource;
	context;
	_scale = 1;
	minScale = 0.5;
	maxScale = 4;

	constructor(ctx) {
		this.context = ctx;
		
		// Fast map drawing.
		const offscrnCanvas = new OffscreenCanvas(this.width, this.height);
		this.offscrnCtx = offscrnCanvas.getContext("2d");
		
		this.addNewLayer();
	}

	getTileIndexByPos(relX, relY) {
		const x = relX % this.width / this.tileSize;
		const y = relY % this.height / this.tileSize;
		
		return ( y * this.rows ) + x;
	}

	isPosInMap(x, y) {
		return (
			x >= 0 &&
			x < this.width * this.scale &&
			y >= 0 &&
			y < this.height * this.scale
		);
	}

	draw() {
		this.context.drawImage(this.offscrnCtx.canvas, 0, 0);
	}

	renderMap() {
		this.offscrnCtx.clearRect(0, 0, this.width, this.height);
		this.offscrnCtx.fillStyle = "rgb(235, 133, 0)";
		
		const lay = this.getActiveLayer();
		const tileSize = this.tileSize;
		const rows = this.rows;
		let x = 0;
		let y = 0;
		
		for(let i=0; i<lay.length; i++) {
			const tile = lay[i];

			//if(tile) this.offscrnCtx.fillRect(x, y, tileSize, tileSize);
			if(tile) {
				this.offscrnCtx.drawImage(this.imageSource,
																	tile.x, tile.y,
																	tileSize, tileSize,
																	x, y,
																	tileSize, tileSize);
			}
			
			//this.offscrnCtx.fillText(`${x},${y}`, x, y);
			x += tileSize;
			
			if((i+1) % rows === 0) {
				y += tileSize;
				x = 0;
			}
		}
	}

	addNewLayer() {
		const arr = Array(this.cols * this.rows);
		this.layers.push(arr);
	}

	removeLayerByIndex(idx) {
		this.layers.splice(idx, 1);
	}

	fillTileByIndex(idx, val) {
		this.#layer[idx] = val;
		
		this.renderMap();
	}

	removeTileByIndex(idx) {
		delete this.#layer[idx];
		
		this.renderMap();
	}

	setImageSource(image) {
		this.imageSource = image;
	}

	setActiveLayerIndex(idx) {
		this.activeLayerIndex = idx;
	}

	getActiveLayer() {
		return this.layers[this.activeLayerIndex];
	}

	get #layer() {
		return this.getActiveLayer();
	}
	
	get scale() {
		return this._scale;
	}

	set scale(value) {
		this._scale += value;
		this._scale = Math.min(Math.max(this._scale, this.minScale), this.maxScale);
	}

	get width()  {
		return this.rows * this.tileSize;
	}

	get height()  {
		return this.cols * this.tileSize;
	}
}