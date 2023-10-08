import { readFile } from 'fs';
import { App, Editor, ItemView, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, renderResults } from 'obsidian';
import { pathToFileURL } from 'url';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

const CANVAS_PATH_REGEX = new RegExp("(/?[a-zA-Z0-9\\-\\.])+\\.canvas");

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.registerMarkdownCodeBlockProcessor("canvas", async (source, el, ctx) => {
			console.log("---------------------------RELOAD--------------------------");
			let path = source.split('\n').filter(line => CANVAS_PATH_REGEX.test(line)).first();

			if (path == null) {
				new Notice("Invalid path to canvas!");
				return;
			}

			let canvasFile = this.app.vault.getFiles().filter(x => x.path == path).first();
			if (canvasFile == null) {
				new Notice("Coulnd't find canvas file at the given path!");
				return;
			}


			let canvasFileContent = await this.app.vault.read(canvasFile);
			let canvas = JSON.parse(canvasFileContent) as Canvas;

			let minX = Math.min(...canvas.nodes.map(node => node.x)) - 50;
			let minY = Math.min(...canvas.nodes.map(node => node.y)) - 50;

			let maxX = Math.max(...canvas.nodes.map(node => node.x + node.width)) + 50;
			let maxY = Math.max(...canvas.nodes.map(node => node.y + node.height)) + 50;

			let width = maxX - minX;
			let height = maxY - minY;

			let heightPerWidth = height / width;

			let id = generateId(32);
			const container = el.createEl("a", {
				cls: "better-canvas-embed",
				attr: {
					id: id as string
				},
				href: `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(path)}`
			});

			canvas.nodes.forEach(node => {
				let elementInfo: DomElementInfo = {
					cls: "node",
					attr: {
						"style": generateNodeStyle(node, minX, minY, width, height) as string
					}
				};

				if (node.type == NodeType.Text) {
					elementInfo
					elementInfo.cls += " text";
					elementInfo.text = node.text as string;
				}

				container.createDiv(elementInfo);
			});

			let viewBox = `0 0 100 100`;
			let svg = container.createSvg("svg", {
				attr: {
					viewBox: viewBox,
					preserveAspectRatio: "none"
				}
			});

			canvas.edges.forEach(edge => {
				let fromNode = canvas.nodes.filter(x => x.id == edge.fromNode).first();
				let toNode = canvas.nodes.filter(x => x.id == edge.toNode).first();
				if (fromNode == null || toNode == null) {
					return;
				}

				let startPos = getPosition(fromNode, edge.fromSide, minX, minY, width, height);
				let endPos = getPosition(toNode, edge.toSide, minX, minY, width, height);

				let dx = Math.abs(startPos.curveX - endPos.curveX);
				let cx = dx * 10 / width * 100;

				let dy = Math.abs(startPos.curveY - endPos.curveY);
				let cy = dy * 10 / width * 100;
				
				let path = `M${startPos.x} ${startPos.y} `;
				path += `L${startPos.curveX} ${startPos.curveY} `;
				if(edge.fromSide == NodeSide.Bottom){
					path += `C${startPos.curveX} ${startPos.curveY + cx} `;
				} else if(edge.fromSide == NodeSide.Top){
					path += `C${startPos.curveX} ${startPos.curveY - cx} `;
				}  else if(edge.fromSide == NodeSide.Left){
					path += `C${startPos.curveX - cy} ${startPos.curveY} `;
				}  else if(edge.fromSide == NodeSide.Right){
					path += `C${startPos.curveX + cy} ${startPos.curveY} `;
				}

				if(edge.toSide == NodeSide.Bottom){
					path +=  `${endPos.curveX} ${endPos.curveY + cx} `;
				} else if(edge.toSide == NodeSide.Top){
					path +=  `${endPos.curveX} ${endPos.curveY - cx} `;
				}  else if(edge.toSide == NodeSide.Left){
					path +=  `${endPos.curveX - cy} ${endPos.curveY} `;
				}  else if(edge.toSide == NodeSide.Right){
					path +=  `${endPos.curveX + cy} ${endPos.curveY} `;
				}

				path +=  `${endPos.curveX} ${endPos.curveY} `;

				if(isHotizontal(edge.toSide)){
					path +=  `L${endPos.curveX - 5 / width * 100} ${endPos.curveY} `;
					path +=  `L${endPos.x} ${endPos.y} `;
					path +=  `L${endPos.curveX + 5 / width * 100} ${endPos.curveY} `;
					path +=  `L${endPos.curveX} ${endPos.curveY} `;
				} else{
					path +=  `L${endPos.curveX} ${endPos.curveY - 5 / height * 100} `;
					path +=  `L${endPos.x} ${endPos.y} `;
					path +=  `L${endPos.curveX} ${endPos.curveY + 5 / height * 100} `;
					path +=  `L${endPos.curveX} ${endPos.curveY} `;
				}


				svg.createSvg("path", {
					attr: {
						d: path
					}
				})
			});

			let lastWidth = 0;
			let interval = window.setInterval(() => {
				let container = document.getElementById(id as string);
				if (container == null) {
					window.clearInterval(interval);
					return;
				}

				let clientWidth = el.clientWidth;
				if (clientWidth == lastWidth) {
					return;
				}
				lastWidth = clientWidth;

				container.style.width = `${clientWidth}px`;
				container.style.height = `${heightPerWidth * clientWidth}px`;
			}, 50);
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function getPosition(node: CanvasNode, side: NodeSide,minX: number, minY: number, width: number, height: number): { x: number, y: number, curveX: number, curveY: number } {
	let x = node.x;
	let y = node.y;

	let curveX = 0;
	let curveY = 0;
	
	if (side == NodeSide.Bottom) {
		x += node.width / 2;
		y += node.height;

		curveX = x;
		curveY = y + 10;
	} else if (side == NodeSide.Top) {
		x += node.width / 2;

		curveX = x;
		curveY = y - 10;
	} else if (side == NodeSide.Left) {
		y += node.height / 2;

		curveX = x - 10;
		curveY = y;
	} else if (side == NodeSide.Right) {
		x += node.width;
		y += node.height / 2;

		curveX = x + 10;
		curveY = y;
	}

	x = (x - minX) / width * 100;
	y = (y - minY) / height * 100;

	curveX = (curveX - minX) / width * 100;
	curveY = (curveY - minY) / height * 100;

	return { x, y, curveX, curveY }
}

function generateId(length: number): String {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

function generateNodeStyle(node: CanvasNode, minX: number, minY: number, width: number, height: number): String {
	let style = "";
	style += `top: ${(node.y - minY) / height * 100}%;`;
	style += `left: ${(node.x - minX) / width * 100}%;`;
	style += `width: ${node.width / width * 100}%;`;
	style += `height: ${node.height / height * 100}%;`;

	return style;
}

class Canvas {
	readonly nodes: CanvasNode[];
	readonly edges: CanvasEdge[];
}

class CanvasNode {
	readonly id: String;
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly type: NodeType;
	readonly text: String;
}

class CanvasEdge {
	readonly id: String;
	readonly fromNode: String;
	readonly fromSide: NodeSide;
	readonly toNode: String;
	readonly toSide: NodeSide;
}

enum NodeType {
	Text = "text"
}
enum NodeSide {
	Bottom = "bottom",
	Left = "left",
	Right = "right",
	Top = "top"
}

function isHotizontal(side: NodeSide){
	return side == NodeSide.Bottom || side == NodeSide.Top;
}