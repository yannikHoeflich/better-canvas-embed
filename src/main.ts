import { App, Editor, EditorChange, Notice, Plugin, normalizePath } from 'obsidian';
import { renderCanvas } from './renderer/render';
import { write } from 'fs';

const CANVAS_PATH_REGEX = new RegExp("(/?[a-zA-Z0-9\\-\\.])+\\.canvas");

const DEFAULT_CANVAS_EMBED_REGEX = new RegExp("!\\[\\[(/?[a-zA-Z0-9\\-\\.])+\.canvas\\]\\]", "m");

export default class BetterCanvasEmbed extends Plugin {

	async onload() {
		this.registerMarkdownPostProcessor((element, context) => {
			window.setTimeout(() => {
				let defaultCanvasEmbeds = element.querySelectorAll(".canvas-embed");
				defaultCanvasEmbeds.forEach(embed => {
					const source = embed.getAttribute("src");
					if (source == null) {
						return;
					}

					let parent = embed.parentElement;
					if(parent == null){
						return;
					}

					let path = parsePath(source);
					embed.remove();
					let el = parent.createDiv({
						cls: "canvas-embed"
					});

					renderCanvas(this, path, el);
				})
			}, 100);
		});

		this.registerMarkdownCodeBlockProcessor("canvas", async (source, el, ctx) => {
			let paths = source.split('\n').filter(line => CANVAS_PATH_REGEX.test(line));

			if (paths.length == 0) {
				new Notice("No valid path to canvas provided!");
				return;
			}

			paths.forEach(path => {
				path = parsePath(path) as string;
				renderCanvas(this, path, el);
			});
		});
	}

	onunload() {
	}
}

function parsePath(path: String): String{
	path = getAbsolutePath(this.app, path);
	path = normalizePath(path as string);
	return path;
}

function getAbsolutePath(app: App, path: String){
	if(path.contains("/")){
		return path;
	}

	return app.vault.getFiles().filter(x => x.name == path).first()?.path ?? path;
}