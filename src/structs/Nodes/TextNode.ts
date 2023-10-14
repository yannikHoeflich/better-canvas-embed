import { App, MarkdownRenderer } from "obsidian";
import { NodeType } from "../NodeType";
import { CanvasNode } from "./CanvasNode";
import BetterCanvasEmbed from "src/main";

export class TextNode extends CanvasNode{
    readonly text: String;

    constructor(id: String, x: number, y: number, width:number, height: number, text: String){
        super(id, x, y, width, height, NodeType.Text);

        this.text = text;
    }
    
    Render(element: HTMLDivElement, plugin: BetterCanvasEmbed): void {
        
        let activeFile = plugin.app.workspace.getActiveFile();

        if(activeFile == null){
            console.log("Error");
            return;
        }

        MarkdownRenderer.render(plugin.app, this.text as string, element, activeFile.path, plugin);
        
        /*const splittedText = this.text.split("\n");
        splittedText.forEach((line) => {
            element.createSpan({
                text: line
            });
        });*/
    }
}