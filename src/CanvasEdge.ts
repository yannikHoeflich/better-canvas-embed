import { NodeSide } from "./NodeSide";


export class CanvasEdge {
    readonly id: String;
    readonly fromNode: String;
    readonly fromSide: NodeSide;
    readonly toNode: String;
    readonly toSide: NodeSide;
}
