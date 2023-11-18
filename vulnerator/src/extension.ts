// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	function checkDependencies() {
		process.chdir("c:\\Users\\alexk\\OneDrive\\Escritorio\\demo\\calendar-mern")
		const directory = child_process.exec('pwd').toString().trim();
		console.log(directory)

		child_process.exec(`npm audit`).stdout?.on('data', (data) => {
			const output = data.split("\n\n")
			let audit: { library: string, vulnerability: string }[] = [];
			let critical = 0;
			let high = 0;
			let moderate = 0;
			let low = 0;
			for (const [element, index] of output) {
				if (index === 0) return;
				const lines = element.split("\n")
				const library = lines[0];
				const vulnerability = lines[1];
				audit.push({
					library: library,
					vulnerability: vulnerability
				})
				if (vulnerability.includes("critical")) { critical = critical + 1; }
				else if (vulnerability.includes("high")) { high = high + 1; }
				else if (vulnerability.includes("moderate")) { moderate = moderate + 1 }
				else if (vulnerability.includes("low")) { low = low++; }
			};


			console.log('critical: ' + critical);
			console.log('high: ' + high);
			console.log('moderate: ' + moderate);
			console.log('low: ' + low);
			vscode.window.showInformationMessage(`${audit.length} vulnerabilities found:`, `Critical: ${critical}`, `High: ${high}`, `Moderate: ${moderate}`, `Low: ${low}`);
		});
	}








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
		checkDependencies();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
