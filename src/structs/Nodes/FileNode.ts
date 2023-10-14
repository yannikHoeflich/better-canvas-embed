import { App, MarkdownRenderer, MarkdownView, TFile } from "obsidian";
import { NodeType } from "../NodeType";
import { CanvasNode } from "./CanvasNode";
import { parsePath } from "src/path_utilities";
import BetterCanvasEmbed from "src/main";

export class FileNode extends CanvasNode{
    public readonly file: String;

    constructor(id: String, x: number, y: number, width:number, height: number, file: String){
        super(id, x, y, width, height, NodeType.File);

        this.file = file;
    }

    Render(element: HTMLDivElement, plugin: BetterCanvasEmbed): void {
        let path = parsePath(this.file, app);

        let file = app.vault.getAbstractFileByPath(path as string);

        if(!(file instanceof TFile)){
            return;
        }

        
        let activeFile = plugin.app.workspace.getActiveFile();
        if(activeFile == null){
            console.log("Error");
            return;
        }

        let imageMarkdown = plugin.app.fileManager.generateMarkdownLink(file, activeFile.path);

        MarkdownRenderer.render(plugin.app, imageMarkdown, element, activeFile.path, plugin);
    }
}