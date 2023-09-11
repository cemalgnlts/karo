import { App } from "/karo/scripts/App.js";
import { SpriteSheetContainer } from "/karo/scripts/SpriteSheetContainer.js";

const app = new App();

window.onload = onLoad;
window.onresize = onResize;

function onLoad() {
	app.resizeCanvas();
	app.updateCanvas();
	
	const spriteCanvas = new SpriteSheetContainer(app.map.tileSize);
	spriteCanvas.loadFromUrl("/assets/dungeons.png");
	spriteCanvas.onSelected = tile => app.setTile(tile);
	spriteCanvas.onImageLoaded = img => app.map.setImageSource(img);
}

function onResize() {
	app.resizeCanvas();
}