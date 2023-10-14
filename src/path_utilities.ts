import { App, normalizePath } from "obsidian";

export function parsePath(path: String, app: App): String{
	path = getAbsolutePath(app, path);
	path = normalizePath(path as string);
	return path;
}

function getAbsolutePath(app: App, path: String){
	if(path.contains("/")){
		return path;
	}

	return app.vault.getFiles().filter(x => x.name == path).first()?.path ?? path;
}