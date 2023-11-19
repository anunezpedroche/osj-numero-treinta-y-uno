import * as vscode from "vscode";
import * as child_process from "child_process";
import * as utils from "./helpers/helpers";

const severityLevel = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

type SeverityType = keyof typeof severityLevel;

export function activate(context: vscode.ExtensionContext) {
  let vulnerabilities: utils.AuditData[] = [];
  function checkDependencies() {
    const current = utils.getCurrentDirectory();
    console.log(current);

    const command = utils.getDirectoryCommand();
    child_process.execSync(command).toString().trim();
    const lockFileExists = utils.checkLockFileExists();

    if (!lockFileExists) {
      return;
    }

    child_process.exec(`npm audit`).stdout?.on("data", (data) => {
      console.log("patata", data);
      const { audit, counters } = utils.processAuditOutput(data.toString());

      console.log(audit);
      const activeTextEditor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (audit.length === 0) {
        return;
      }
      vulnerabilities = audit;
      if (!activeTextEditor?.document) return;
      updateDecorationsForUri(activeTextEditor.document.uri);
      utils.showAuditResults(audit, counters);
    });
  }
  const PACKAGE_PATH = `${
    vscode.workspace.workspaceFolders?.[0].uri ?? ""
  }/package.json` as unknown as vscode.Uri;

  let _statusBarItem: vscode.StatusBarItem;

  let disposable = vscode.commands.registerCommand("vulnerator.scanV", () => {
    checkDependencies();
  });
  context.subscriptions.push(disposable);

  function GetCriticalBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const criticalColor: string =
      cfg.get("criticalColor") || "rgba(240,10,0,0.5)";
    return criticalColor;
  }

  function GetCriticalTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const criticalTextColor: string =
      cfg.get("criticalTextColor") || "rgba(240,240,240,1.0)";
    return criticalTextColor;
  }

  function GetHighBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const highColor: string = cfg.get("highColor") || "rgba(200,100,0,0.5)";
    return highColor;
  }
  function GetHighTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const highTextColor: string =
      cfg.get("highTextColor") || "rgba(240,240,240,1.0)";
    return highTextColor;
  }

  function GetModerateBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const moderateColor: string =
      cfg.get("moderateColor") || "rgba(40,20,120,0.5)";
    return moderateColor;
  }

  function GetModerateTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const moderateTextColor: string =
      cfg.get("moderateTextColor") || "rgba(240,240,240,1.0)";
    return moderateTextColor;
  }

  function GetLowBackgroundColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const lowColor: string = cfg.get("lowColor") || "rgba(20,120,40,0.5)";
    return lowColor;
  }

  function GetLowTextColor(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const lowTextColor: string =
      cfg.get("lowTextColor") || "rgba(240,240,240,1.0)";
    return lowTextColor;
  }

  function GetAnnotationFontStyle(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const annotationFontStyle: string = cfg.get("fontStyle") || "italic";
    return annotationFontStyle;
  }

  function GetAnnotationFontWeight(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const annotationFontWeight: string = cfg.get("fontWeight") || "normal";
    return annotationFontWeight;
  }

  function GetAnnotationMargin(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const annotationMargin: string = cfg.get("fontMargin") || "40px";
    return annotationMargin;
  }

  let criticalDecoration: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: GetCriticalBackgroundColor(),
      textDecoration: GetCriticalTextColor(),
    });
  let highDecoration: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: GetHighBackgroundColor(),
      textDecoration: GetHighTextColor(),
    });
  let moderateDecoration: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: GetModerateBackgroundColor(),
      textDecoration: GetModerateTextColor(),
    });
  let lowDecoration: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: GetLowBackgroundColor(),
      textDecoration: GetLowTextColor(),
    });

  function GetStatusBarControl(): string {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const statusBarControl: string =
      cfg.get("statusBarControl") || "hide-when-no-issues";
    return statusBarControl;
  }

  function AddAnnotationTextPrefixes(): boolean {
    const cfg = vscode.workspace.getConfiguration("vulnerator");
    const addAnnotationTextPrefixes: boolean =
      cfg.get("addAnnotationTextPrefixes") || false;
    return addAnnotationTextPrefixes;
  }

  vscode.languages.onDidChangeDiagnostics(
    (diagnosticChangeEvent) => {
      onChangedDiagnostics(diagnosticChangeEvent);
    },
    null,
    context.subscriptions
  );

  function onChangedDiagnostics(
    diagnosticChangeEvent: vscode.DiagnosticChangeEvent
  ) {
    if (!vscode.window) {
      return;
    }

    const activeTextEditor: vscode.TextEditor | undefined =
      vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }

    // Many URIs can change - we only need to decorate the active text editor
    for (const uri of diagnosticChangeEvent.uris) {
      // Only update decorations for the active text editor.
      if (uri.fsPath === activeTextEditor.document.uri.fsPath) {
        updateDecorationsForUri(activeTextEditor.document.uri);
        break;
      }
    }
  }

  function updateDecorationsForUri(uriToDecorate: vscode.Uri) {
    if (!uriToDecorate) {
      return;
    }

    if (!uriToDecorate.fsPath.includes("package.json")) {
      return;
    }

    // Only process "file://" URIs.
    if (uriToDecorate.scheme !== "file") {
      return;
    }
    if (vulnerabilities.length <= 0) {
      return;
    }
    if (!vscode.window) {
      return;
    }

    const activeTextEditor: vscode.TextEditor | undefined =
      vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }

    if (!activeTextEditor.document.uri.fsPath) {
      return;
    }

    const criticalDecorationOptions: vscode.DecorationOptions[] = [];
    const highDecorationOptions: vscode.DecorationOptions[] = [];
    const moderateDecorationOptions: vscode.DecorationOptions[] = [];
    const lowDecorationOptions: vscode.DecorationOptions[] = [];
    let numCritical = 0;
    let numHigh = 0;
    let numModerte = 0;
    let numLow = 0;

    let aggregatedDiagnostics: any = {};
    let diagnostic: vscode.Diagnostic;
    let a = vscode.window.activeTextEditor;

    const lines = a?.document.getText().split("\n");
    if (!lines) {
      return;
    }

    lines.forEach((line, index) => {
      const pruebas = [
        { library: "eslint", vulnerability: "critical" },
        { library: "concurrently", vulnerability: "high" },
        { library: "autoprefixer", vulnerability: "moderate" },
        { library: "@tailwindcss/typography", vulnerability: "low" },
      ];
      for (const dependency of vulnerabilities) {
        const d = line.replace("\t", "").split(":")[0].split('"')[1];
        console.log(dependency.library, d);
        if (dependency.library === d) {
          let key = `line${index}`;
          const positionStart = new vscode.Position(Number(index), 1);
          const positionEnd = new vscode.Position(Number(index), d.length);
          const rang = new vscode.Range(positionStart, positionEnd);

          let diag = new vscode.Diagnostic(
            rang,
            dependency.vulnerability,
            severityLevel[dependency.vulnerability.split(':')[1].trim() as SeverityType]
          );
          if (aggregatedDiagnostics[key]) {
            // Already added an object for this key, so augment the arrayDiagnostics[] array.
            aggregatedDiagnostics[key].arrayDiagnostics.push(diag);
          } else {
            // Create a new object for this key, specifying the line: and a arrayDiagnostics[] array
            aggregatedDiagnostics[key] = {
              line: diag.range.start.line,
              arrayDiagnostics: [diag],
            };
          }
          switch (diag.severity) {
            case 0:
              numCritical += 1;
              break;

            case 1:
              numHigh += 1;
              break;
            case 2:
              numModerte += 1;
              break;
            case 3:
              numLow += 1;
              break;
          }
        }
      }
    });

    console.log(aggregatedDiagnostics);

    for (diagnostic of vscode.languages.getDiagnostics(uriToDecorate)) {
      let key = "line" + diagnostic.range.start.line;
      if (aggregatedDiagnostics[key]) {
        aggregatedDiagnostics[key].arrayDiagnostics.push(diagnostic);
      }
    }

    let key: any;
    for (key in aggregatedDiagnostics) {
      // Iterate over property values (not names)
      let aggregatedDiagnostic = aggregatedDiagnostics[key];
      let messagePrefix: string = "";

      let decorationTextColor;

      const decInstanceRenderOptions: vscode.DecorationInstanceRenderOptions = {
        after: {
          contentText: truncate(
            messagePrefix + aggregatedDiagnostic.arrayDiagnostics[0].message
          ),
          fontStyle: GetAnnotationFontStyle(),
          fontWeight: GetAnnotationFontWeight(),
          margin: GetAnnotationMargin(),
          color: decorationTextColor,
        },
      };
      const diagnosticDecorationOptions: vscode.DecorationOptions = {
        range: aggregatedDiagnostic.arrayDiagnostics[0].range,
        renderOptions: decInstanceRenderOptions,
      };

      switch (aggregatedDiagnostic.arrayDiagnostics[0].severity) {
        // CRITICAL
        case 0:
          criticalDecorationOptions.push(diagnosticDecorationOptions);
          break;
        // HIGH
        case 1:
          highDecorationOptions.push(diagnosticDecorationOptions);
          break;
        // MODERATE
        case 2:
          moderateDecorationOptions.push(diagnosticDecorationOptions);
          break;
        // LOW
        case 3:
          lowDecorationOptions.push(diagnosticDecorationOptions);
          break;
      }
    }
    activeTextEditor.setDecorations(
      criticalDecoration,
      criticalDecorationOptions
    );
    activeTextEditor.setDecorations(highDecoration, highDecorationOptions);
    activeTextEditor.setDecorations(
      moderateDecoration,
      moderateDecorationOptions
    );
    activeTextEditor.setDecorations(lowDecoration, lowDecorationOptions);

    updateStatusBar(numCritical, numHigh, numModerte, numLow);
  }

  function updateStatusBar(
    numCritical: number,
    numHigh: number,
    numModerate: number,
    numLow: number
  ) {
    const totalVulnerabilities = numCritical + numCritical + numHigh + numLow;
    if (!_statusBarItem) {
      _statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
      );
    }

    const statusBarControl = GetStatusBarControl();
    var showStatusBarText = false;

    if (statusBarControl === "always") {
      showStatusBarText = true;
    } else if (statusBarControl === "never") {
      showStatusBarText = false;
    } else if (statusBarControl === "hide-when-no-issues") {
      if (numCritical + numCritical + numHigh + numLow > 0) {
        showStatusBarText = true;
      }
    }

    const activeTextEditor: vscode.TextEditor | undefined =
      vscode.window.activeTextEditor;

    if (!activeTextEditor || showStatusBarText === false) {
      // No open text editor or don't want to show ErrorLens info.
      _statusBarItem.hide();
    } else {
      let statusBarText: string;

      if (totalVulnerabilities === 0) {
        statusBarText = "Vulnerator: No vulnerabilities detected";
      } else {
        statusBarText =
          "$(warning) Vulnerabilities " +
          "C:" +
          numCritical +
          " H:" +
          numHigh +
          " M:" +
          numModerate +
          " L:" +
          numLow;
      }

      _statusBarItem.text = statusBarText;

      _statusBarItem.show();
    }
  }
  function truncate(str: string): string {
    const truncationLimit: number = 300;
    return str.length > truncationLimit
      ? str.slice(0, truncationLimit) + "…"
      : str;
  }

  checkDependencies();
}

// This method is called when your extension is deactivated
export function deactivate() {}
