import { NodeType } from "./NodeType";


export class CanvasNode {
    readonly id: String;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly type: NodeType;
    readonly text: String;
}
