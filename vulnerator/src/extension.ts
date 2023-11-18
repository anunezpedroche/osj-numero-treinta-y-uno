// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NodeDependenciesProvider } from './node-dependencies-provider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vulnerator" is now active!');
	const rootPath =
	vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
	  ? vscode.workspace.workspaceFolders[0].uri.fsPath
	  : undefined;
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const dependenciesProvider = new NodeDependenciesProvider(rootPath??'');
	const dependencies = await dependenciesProvider.getChildren();
	console.log(dependencies);
	
	//vscode.window.createTreeView('nodeDependencies',{treeDataProvider:new NodeDependenciesProvider(rootPath??'')}),
	vscode.window.showInformationMessage(JSON.stringify(rootPath));

	function GetErrorBackgroundColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const errorColor : string = cfg.get("errorColor") || "rgba(240,10,0,0.5)";
        return errorColor;
    }

    function GetErrorTextColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const errorTextColor : string = cfg.get("errorTextColor") || "rgba(240,240,240,1.0)";
        return errorTextColor;
    }

    function GetWarningBackgroundColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const warningColor : string = cfg.get("warningColor") || "rgba(200,100,0,0.5)";
        return warningColor;
    }

    function GetWarningTextColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const warningTextColor : string = cfg.get("warningTextColor") || "rgba(240,240,240,1.0)";
        return warningTextColor;
    }

    function GetInfoBackgroundColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const infoColor : string = cfg.get("infoColor") || "rgba(40,20,120,0.5)";
        return infoColor;
    }

    function GetInfoTextColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const infoTextColor : string = cfg.get("infoTextColor") || "rgba(240,240,240,1.0)";
        return infoTextColor;
    }

    function GetHintBackgroundColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const hintColor : string = cfg.get("hintColor") || "rgba(20,120,40,0.5)";
        return hintColor;
    }

    function GetHintTextColor() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const hintTextColor : string = cfg.get("hintTextColor") || "rgba(240,240,240,1.0)";
        return hintTextColor;
    }

    function GetAnnotationFontStyle() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const annotationFontStyle : string = cfg.get("fontStyle") || "italic";
        return annotationFontStyle;
    }

    function GetAnnotationFontWeight() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const annotationFontWeight : string = cfg.get("fontWeight") || "normal";
        return annotationFontWeight;
    }

    function GetAnnotationMargin() : string
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const annotationMargin : string = cfg.get("fontMargin") || "40px";
        return annotationMargin;
    }

    function GetEnabledDiagnosticLevels() : string[]
    {
        const cfg = vscode.workspace.getConfiguration("vulnerator");
        const enabledDiagnosticLevels : string[] = cfg.get("enabledDiagnosticLevels") || ["error", "warning"];
        return enabledDiagnosticLevels;
    }

	let errorLensDecorationTypeError: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: GetErrorBackgroundColor()
    });
    let errorLensDecorationTypeWarning: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: GetWarningBackgroundColor()
    });
    let errorLensDecorationTypeInfo: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: GetInfoBackgroundColor()
    });
    let errorLensDecorationTypeHint: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: GetHintBackgroundColor()
    });


}

// This method is called when your extension is deactivated
export function deactivate() {}
