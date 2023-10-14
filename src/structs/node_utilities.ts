import { NodeType } from "src/structs/NodeType";
import { CanvasNode } from "src/structs/Nodes/CanvasNode";
import { FileNode } from "src/structs/Nodes/FileNode";
import { TextNode } from "src/structs/Nodes/TextNode";



export function ParseJsonToNode(json: any): CanvasNode {
    switch (json.type) {
        case NodeType.Text:
            return new TextNode(json.id, json.x, json.y, json.width, json.height, json.text);
        case NodeType.File:
            return new FileNode(json.id, json.x, json.y, json.width, json.height, json.file);
    }

    console.log("Unsupported Canvas type");
    return json as CanvasNode;
}