import { App, Editor, EditorChange, MarkdownView, Notice, Plugin, normalizePath } from 'obsidian';
import { renderCanvas } from './renderer/render';
import { write } from 'fs';
import { parsePath } from './path_utilities';

const CANVAS_PATH_REGEX = new RegExp("(/?[a-zA-Z0-9\\-\\.])+\\.canvas");

const DEFAULT_CANVAS_EMBED_REGEX = new RegExp("!\\[\\[(/?[a-zA-Z0-9\\-\\.])+\.canvas\\]\\]", "m");

export default class BetterCanvasEmbed extends Plugin {
	observer: MutationObserver

	async onload() {
		this.registerMarkdownCodeBlockProcessor("canvas", async (source, el, ctx) => {
			let paths = source.split('\n').filter(line => CANVAS_PATH_REGEX.test(line));

			if (paths.length == 0) {
				new Notice("No valid path to canvas provided!");
				return;
			}

			paths.forEach(path => {
				path = parsePath(path, this.app) as string;
				renderCanvas(this, path, el);
			});
		});

		this.observer = new MutationObserver((mutations: MutationRecord[]) => {
			mutations.forEach((rec: MutationRecord) => {
				if (rec.type === 'childList') {
					let defaultCanvasEmbeds = (<Element>rec.target).querySelectorAll(".canvas-embed");
					defaultCanvasEmbeds.forEach(embed => {
						if(!embed.classList.contains("default-canvas-embed-override")){
							embed.classList.add("default-canvas-embed-override");
						}

						if(embed.querySelector(".canvas-minimap") == null){
							return;
						}

						embed.innerHTML = "";

						const source = embed.getAttribute("src");
						if (source == null) {
							return;
						}

						let path = parsePath(source, this.app);


						let el = embed.createDiv();

						renderCanvas(this, path, el);
					})
				}
			})
		})
		this.observer.observe(document.body, { subtree: true, childList: true })
	}


	onunload() {
	}
}