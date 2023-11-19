

export function getCurrentDirectoryCommand() {
    const os = process.platform;
    const command = os === "win32" ? 'echo %cd%' : 'pwd';
    return command;
}