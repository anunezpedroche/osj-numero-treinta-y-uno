// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	function checkDependencies() {
		// get current working vscode directory
		const current = vscode.workspace.rootPath ?? "";
		console.log(current);

		process.chdir(current)
		const os = process.platform;
		const command = os === "win32" ? 'echo %cd%' : 'pwd';
		const directory = child_process.execSync(command).toString().trim();
		console.log(JSON.stringify(directory));

		child_process.exec(`npm audit`).stdout?.on('data', (data) => {
			const output = data.split("\n\n")
			let audit: { library: string, version: string, vulnerability: string }[] = [];
			let critical = 0;
			let high = 0;
			let moderate = 0;
			let low = 0;
			for (let index = 0; index < output.length; index++) {
				if (index === 0) continue;
				const lines = output[index].split("\n")
				const libraryData = lines[0];
				console.log(libraryData);
				const librarySplit = libraryData.split("  ");
				const libraryName = librarySplit[0].trim();
				let version;
				if (librarySplit.length > 1) {
					version = librarySplit[1].trim();
				}

				if (lines.length < 2) continue;
				const vulnerability = lines[1]
				if (!vulnerability.includes("Severity")) continue;
				audit.push({
					library: libraryName,
					version: version,
					vulnerability: vulnerability
				})
				if (vulnerability.includes("critical")) { critical = critical + 1; }
				else if (vulnerability.includes("high")) { high = high + 1; }
				else if (vulnerability.includes("moderate")) { moderate = moderate + 1 }
				else if (vulnerability.includes("low")) { low = low++; }
			};
			console.log(audit);
			vscode.window.showWarningMessage(
				`${audit.length} vulnerabilities found:\nCritical: ${critical}\nHigh: ${high}\nModerate: ${moderate}\nLow: ${low}`
			);
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
	checkDependencies();
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
