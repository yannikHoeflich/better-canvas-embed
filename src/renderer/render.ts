import { App, Notice, TFile } from "obsidian";
import BetterCanvasEmbed from "../main";
import { renderNode } from "./render_node";
import { renderEdge } from "./render_edge";
import { CanvasDimensions } from "../structs/CanvasDimensions";
import { Canvas } from "../structs/Canvas";
import { CanvasNode } from "src/structs/Nodes/CanvasNode";
import { ParseJsonToNode } from "../structs/node_utilities";

export async function renderCanvas(plugin: BetterCanvasEmbed, path: String, parentElement: HTMLElement){
    let app = plugin.app;

    const canvasFile = app.vault.getAbstractFileByPath(path as string);
    if (!(canvasFile instanceof TFile)) {
        new Notice("Coulnd't find canvas file at the given path!");
        return;
    }

    let activeFile = app.workspace.getActiveFile();

    if(activeFile == canvasFile){
        new Notice("Please don't embed a canvas in it self!");
        return;
    }

    const canvas = await getCanvas(app, canvasFile);

    var dimensions = getCanvasDimensions(canvas);

    const heightPerWidth = dimensions.height / dimensions.width;

    const id = generateId(32);

    const container = CreateContainer(app, parentElement, id, path, heightPerWidth);

    canvas.nodes.forEach(node => {
        let parsedNode = ParseJsonToNode(node);
        renderNode(parsedNode, dimensions, container, plugin);
    });

    const svg = createSvg(container);

    canvas.edges.forEach(edge => {
        renderEdge(edge, canvas, dimensions, svg)
    });
}

function createSvg(container: HTMLAnchorElement) {
    const viewBox = `0 0 100 100`;
    const svg = container.createSvg("svg", {
        cls: "line-svg",
        attr: {
            viewBox: viewBox,
            preserveAspectRatio: "none"
        }
    });
    return svg;
}



function CreateContainer(app: App, parentElement: HTMLElement, id: String, path: String, heightPerWidth: number): HTMLAnchorElement {
    return parentElement.createEl("a", {
        cls: "better-canvas-embed",
        attr: {
            id: id as string,
            style: `aspect-ratio: ${1/heightPerWidth}`
        },
        href: `obsidian://open?vault=${encodeURIComponent(app.vault.getName())}&file=${encodeURIComponent(path as string)}`
    });
}

function getCanvasDimensions(canvas: Canvas): CanvasDimensions {
    let minX = Math.min(...canvas.nodes.map(node => node.x)) - 50;
    const minY = Math.min(...canvas.nodes.map(node => node.y)) - 50;

    let maxX = Math.max(...canvas.nodes.map(node => node.x + node.width)) + 50;
    const maxY = Math.max(...canvas.nodes.map(node => node.y + node.height)) + 50;

    let width = maxX - minX;
    const height = maxY - minY;

    if (width < 500) {
        let widthDiff = 500 - width;
        minX -= widthDiff;
        maxX += widthDiff;
        width = maxX - minX;
    }

    return { height, width, minX, minY, maxX, maxY };
}

async function getCanvas(app: App, canvasFile: TFile) {
    const canvasFileContent = await app.vault.read(canvasFile);
    const canvas = JSON.parse(canvasFileContent) as Canvas;
    return canvas;
}


function generateId(length: number): String {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const charactersLength = characters.length;
	
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}