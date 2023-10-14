import { App } from "obsidian";
import { NodeType } from "../NodeType";
import BetterCanvasEmbed from "src/main";


export abstract class CanvasNode {
    readonly id: String;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly type: NodeType;

    constructor(id: String, x: number, y: number, width:number, height: number, type:NodeType){
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    abstract Render(element: HTMLDivElement, plugin: BetterCanvasEmbed): void;

}
