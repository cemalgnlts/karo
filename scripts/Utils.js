/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} tileSize
 * @param {Number} mapWidth
 * @param {Number} mapHeight
 */
function drawGrid(ctx, tileSize, mapWidth, mapHeight, dashed = true) {
	ctx.strokeStyle = "#555";

	// Checkered background.
	ctx.beginPath();
	
	if(dashed) ctx.setLineDash([tileSize / 8]);

	for(let x=0; x<mapWidth; x+=tileSize) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, mapHeight);
	}

	for(let y=0; y<mapHeight; y+=tileSize) {
		ctx.moveTo(0, y);
		ctx.lineTo(mapWidth, y);
	}

	ctx.stroke();
	
	ctx.setLineDash([]);

	ctx.strokeRect(0, 0, mapWidth, mapHeight);
}

/**
 * @param {Number} pos
 */
function toGridPos(pos, tileSize, scale = 1) {
	return Math.floor(pos / tileSize / scale) * tileSize;
}

const PIXEL_RATIO = Math.min(2, window.devicePixelRatio);

export {
	drawGrid,
	toGridPos,
	PIXEL_RATIO
};