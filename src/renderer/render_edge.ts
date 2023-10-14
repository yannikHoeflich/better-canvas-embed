import { NodeSide } from "../structs/NodeSide";
import { CanvasEdge } from "../structs/CanvasEdge";
import { CanvasNode } from "../structs/Nodes/CanvasNode";
import { Canvas } from "../structs/Canvas";
import { CanvasDimensions } from "../structs/CanvasDimensions";

export function renderEdge(edge: CanvasEdge, canvas: Canvas, dimensions: CanvasDimensions, svg: SVGSVGElement) {
    const fromNode = canvas.nodes.filter(x => x.id == edge.fromNode).first();
    const toNode = canvas.nodes.filter(x => x.id == edge.toNode).first();
    if (fromNode == null || toNode == null) {
        return;
    }

    const startPos = getEdgeStartPosition(fromNode, edge.fromSide, dimensions);
    const endPos = getEdgeStartPosition(toNode, edge.toSide, dimensions);

    const { cx, cy } = createCurveAnchorPoints(startPos, endPos, dimensions);

    const path = GeneratePath(startPos, edge, cx, cy, endPos, dimensions);

    svg.createSvg("path", {
        attr: {
            d: path
        }
    })
}

function GeneratePath(startPos: { x: number; y: number; curveX: number; curveY: number; }, edge: CanvasEdge, cx: number, cy: number, endPos: { x: number; y: number; curveX: number; curveY: number; }, dimensions: CanvasDimensions) {
    let path = `M${startPos.x} ${startPos.y} `;
    path += `L${startPos.curveX} ${startPos.curveY} `;
    if (edge.fromSide == NodeSide.Bottom) {
        path += `C${startPos.curveX} ${startPos.curveY + cx} `;
    } else if (edge.fromSide == NodeSide.Top) {
        path += `C${startPos.curveX} ${startPos.curveY - cx} `;
    } else if (edge.fromSide == NodeSide.Left) {
        path += `C${startPos.curveX - cy} ${startPos.curveY} `;
    } else if (edge.fromSide == NodeSide.Right) {
        path += `C${startPos.curveX + cy} ${startPos.curveY} `;
    }

    if (edge.toSide == NodeSide.Bottom) {
        path += `${endPos.curveX} ${endPos.curveY + cx} `;
    } else if (edge.toSide == NodeSide.Top) {
        path += `${endPos.curveX} ${endPos.curveY - cx} `;
    } else if (edge.toSide == NodeSide.Left) {
        path += `${endPos.curveX - cy} ${endPos.curveY} `;
    } else if (edge.toSide == NodeSide.Right) {
        path += `${endPos.curveX + cy} ${endPos.curveY} `;
    }

    path += `${endPos.curveX} ${endPos.curveY} `;

    if (edge.toSide == NodeSide.Bottom || edge.toSide == NodeSide.Top) {
        path += `L${endPos.curveX - 5 / dimensions.width * 100} ${endPos.curveY} `;
        path += `L${endPos.x} ${endPos.y} `;
        path += `L${endPos.curveX + 5 / dimensions.width * 100} ${endPos.curveY} `;
        path += `L${endPos.curveX} ${endPos.curveY} `;
    } else {
        path += `L${endPos.curveX} ${endPos.curveY - 5 / dimensions.height * 100} `;
        path += `L${endPos.x} ${endPos.y} `;
        path += `L${endPos.curveX} ${endPos.curveY + 5 / dimensions.height * 100} `;
        path += `L${endPos.curveX} ${endPos.curveY} `;
    }
    return path;
}

function createCurveAnchorPoints(startPos: { x: number; y: number; curveX: number; curveY: number; }, endPos: { x: number; y: number; curveX: number; curveY: number; }, dimensions: CanvasDimensions) {
    const dx = Math.abs(startPos.curveX - endPos.curveX);

    const dy = Math.abs(startPos.curveY - endPos.curveY);

    let diff = 0;
    if (dx == 0) {
        diff = dy;
    } else if (dy == 0) {
        diff = dx;
    } else {
        diff = dx * dy;
    }

    if (diff < 50) {
        diff = 50;
    }

    if (diff > 200) {
        diff = 200;
    }

    const cx = diff / dimensions.height * 100;
    const cy = diff / dimensions.width * 100;
    return { cx, cy };
}

function getEdgeStartPosition(node: CanvasNode, side: NodeSide, dimensions: CanvasDimensions): { x: number, y: number, curveX: number, curveY: number } {
    let x = node.x;
    let y = node.y;

    let curveX = 0;
    let curveY = 0;

    switch (side) {
        case NodeSide.Bottom:
            x += node.width / 2;
            y += node.height;

            curveX = x;
            curveY = y + 10;
            break;
        case NodeSide.Top:
            x += node.width / 2;

            curveX = x;
            curveY = y - 10;
            break;
        case NodeSide.Left:
            y += node.height / 2;

            curveX = x - 10;
            curveY = y;
            break;
        case NodeSide.Right:
            x += node.width;
            y += node.height / 2;

            curveX = x + 10;
            curveY = y;
            break;
    }

    x = (x - dimensions.minX) / dimensions.width * 100;
    y = (y - dimensions.minY) / dimensions.height * 100;

    curveX = (curveX - dimensions.minX) / dimensions.width * 100;
    curveY = (curveY - dimensions.minY) / dimensions.height * 100;

    return { x, y, curveX, curveY }
}