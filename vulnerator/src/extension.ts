
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as utils from './helpers/helpers';

export function activate(context: vscode.ExtensionContext) {
	function checkDependencies() {
		const current = utils.getCurrentDirectory();
		console.log(current);

		const command = utils.getDirectoryCommand();
		child_process.execSync(command).toString().trim();
		const lockFileExists = utils.checkLockFileExists();


		if (!lockFileExists) {
			return;
		}

		child_process.exec(`npm audit`).stdout?.on('data', (data) => {
			const { audit, counters } = utils.processAuditOutput(data.toString());

			if (audit.length === 0) {
				return;
			}

			utils.showAuditResults(audit, counters);
		});
	}


	let disposable = vscode.commands.registerCommand('vulnerator.scanV', () => {
		checkDependencies();
	});
	checkDependencies();
	context.subscriptions.push(disposable);
}

export function deactivate() { }