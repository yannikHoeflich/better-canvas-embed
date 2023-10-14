import { NodeType } from "../structs/NodeType";
import { CanvasNode } from "../structs/Nodes/CanvasNode";
import { CanvasDimensions } from "../structs/CanvasDimensions";
import { App } from "obsidian";
import BetterCanvasEmbed from "src/main";

export function renderNode(node: CanvasNode, dimensions: CanvasDimensions, container: HTMLAnchorElement, plugin: BetterCanvasEmbed) {
    const elementInfo: DomElementInfo = {
        cls: "node",
        attr: {
            "style": generateNodeStyle(node, dimensions) as string
        }
    };

    elementInfo.cls += ` ${node.type.toLocaleLowerCase()}`;

    const nodeElement = container.createDiv(elementInfo);

    node.Render(nodeElement, plugin);
}

function generateNodeStyle(node: CanvasNode, dimensions: CanvasDimensions): String {
	let style = "";
	style += `top: ${(node.y - dimensions.minY) / dimensions.height * 100}%;`;
	style += `left: ${(node.x - dimensions.minX) / dimensions.width * 100}%;`;
	style += `width: ${node.width / dimensions.width * 100}%;`;
	style += `height: ${node.height / dimensions.height * 100}%;`;

	return style;
}