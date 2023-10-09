import { NodeType } from "../structs/NodeType";
import { CanvasNode } from "../structs/CanvasNode";
import { CanvasDimensions } from "../structs/CanvasDimensions";

export function renderNode(node: CanvasNode, dimensions: CanvasDimensions, container: any) {
    const elementInfo: DomElementInfo = {
        cls: "node",
        attr: {
            "style": generateNodeStyle(node, dimensions) as string
        }
    };

    if (node.type == NodeType.Text) {
        elementInfo.cls += " text";
    }

    const nodeElement = container.createDiv(elementInfo);

    const splittedText = node.text.split("\n");

    if (node.type == NodeType.Text) {
        splittedText.forEach((line) => {
            nodeElement.createSpan({
                text: line
            });
        });
    }
}

function generateNodeStyle(node: CanvasNode, dimensions: CanvasDimensions): String {
	let style = "";
	style += `top: ${(node.y - dimensions.minY) / dimensions.height * 100}%;`;
	style += `left: ${(node.x - dimensions.minX) / dimensions.width * 100}%;`;
	style += `width: ${node.width / dimensions.width * 100}%;`;
	style += `height: ${node.height / dimensions.height * 100}%;`;

	return style;
}