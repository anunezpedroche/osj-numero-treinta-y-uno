import * as vscode from 'vscode';
import * as child_process from 'child_process';
import fs from 'fs';

interface AuditData {
    library: string;
    version?: string;
    vulnerability: string;
}

export function getCurrentDirectory(): string {
    const current = vscode.workspace.rootPath ?? "";
    process.chdir(current);
    return current;
}

export function getDirectoryCommand(): string {
    const os = process.platform;
    return os === "win32" ? 'echo %cd%' : 'pwd';
}

export function checkLockFileExists(): boolean {
    const packageFile = fs.existsSync('package-lock.json');
    const yarnLockFile = fs.existsSync('yarn.lock');
    return packageFile || yarnLockFile;
}

export function processAuditOutput(output: string): { audit: AuditData[]; counters: { [key: string]: number } } {
    const audit: AuditData[] = [];
    const counters: { [key: string]: number } = { critical: 0, high: 0, moderate: 0, low: 0 };

    const entries = output.split('\n\n').slice(1);

    for (const entry of entries) {
        const vulnerabilityData = processVulnerability(entry);
        if (vulnerabilityData) {
            audit.push(vulnerabilityData);
            updateCounters(vulnerabilityData.vulnerability, counters);
        }
    }

    return { audit, counters };
}

export function processVulnerability(entry: string): AuditData | undefined {
    const lines = entry.split('\n');
    const libraryData = lines[0];

    const librarySplit = libraryData.split("  ");
    const libraryName = librarySplit[0].trim();
    let version;
    if (librarySplit.length > 1) {
        version = librarySplit[1].trim();
    }

    if (lines.length < 2 || !lines[1].includes("Severity")) {
        return undefined;
    }

    const vulnerability = lines[1];

    return {
        library: libraryName,
        version,
        vulnerability,
    };
}

export function updateCounters(vulnerability: string, counters: { [key: string]: number }): void {
    for (const severity of ["critical", "high", "moderate", "low"]) {
        if (vulnerability.includes(severity)) {
            counters[severity]++;
        }
    }
}

export function showAuditResults(audit: AuditData[], counters: { [key: string]: number }): void {
    vscode.window.showWarningMessage(
        `${audit.length} vulnerabilities found:\nCritical: ${counters.critical}\nHigh: ${counters.high}\nModerate: ${counters.moderate}\nLow: ${counters.low}`
    );
}