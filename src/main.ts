import { Notice, Plugin, normalizePath } from 'obsidian';
import { renderCanvas } from './render';

const CANVAS_PATH_REGEX = new RegExp("(/?[a-zA-Z0-9\\-\\.])+\\.canvas");

export default class BetterCanvasEmbed extends Plugin {
	public intervals: number[] = [];

	async onload() {
		this.registerMarkdownCodeBlockProcessor("canvas", async (source, el, ctx) => {
			let paths = source.split('\n').filter(line => CANVAS_PATH_REGEX.test(line));

			if (paths.length == 0) {
				new Notice("No valid path to canvas provided!");
				return;
			}
			
			paths.forEach(path => {
				path = normalizePath(path);
				renderCanvas(this, path, el);
			});
		});
	}

	onunload() {
		while(this.intervals.length > 0){
			const interval = this.intervals.pop();
			window.clearInterval(interval);
		}
	}

}