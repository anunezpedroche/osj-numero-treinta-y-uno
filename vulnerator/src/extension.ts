// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// const npmVersion = child_process.execSync('npm -v').toString().trim();
	// const workspaceFolder = vscode.workspace.workspaceFolders
	// console.log(workspaceFolder?.[0].uri)
	process.chdir("c:\\Users\\alexk\\OneDrive\\Escritorio\\demo\\calendar-mern")
	const directory = child_process.execSync('pwd').toString().trim();
	console.log(directory)

	child_process.exec(`npm audit`).stdout?.on('data', (data) => {
		const ouput = data.split("\n\n")
		let audit: { library: string, vulnerability: string }[] = [];
		ouput.forEach((element: string, index: number) => {

			if (index === 0) return;
			const lines = element.split("\n")
			audit.push({
				library: lines[0],
				vulnerability: lines[1]
			})
		});
		console.log(audit)
	});






	// console.log('npm version: ' + npmVersion);


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vulnerator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vulnerator.scanV', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Vulnerator!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
