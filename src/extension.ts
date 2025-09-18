import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

class PlaygroundCodeLensProvider implements vscode.CodeLensProvider {
  onDidChangeCodeLenses?: vscode.Event<void> | undefined;

  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] {
    const filePath = document.fileName;

    // Hanya untuk file PHP
    if (path.extname(filePath) !== ".php") {
      return [];
    }

    // Hanya untuk folder .tinkering
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const rootPath = workspaceFolders?.[0].uri.fsPath ?? "";
    if (!filePath.startsWith(path.join(rootPath, ".tinkering"))) {
      return [];
    }

    const firstLine = new vscode.Range(0, 0, 0, 0);

    return [
      new vscode.CodeLens(firstLine, {
        title: "Run Playground",
        command: "tinkering.run",
        arguments: [],
      }),
    ];
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Function untuk mengatur context agar tombol editor title muncul
  const updateButtonVisibility = (editor?: vscode.TextEditor) => {
    if (!editor || !editor.document) {
      vscode.commands.executeCommand(
        "setContext",
        "tinkering:showButton",
        false
      );
      return;
    }

    const filePath = editor.document.fileName;
    const isPhp = editor.document.languageId === "php";
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const rootPath = workspaceFolders?.[0].uri.fsPath ?? "";
    const inTinkeringFolder = filePath.startsWith(
      path.join(rootPath, ".tinkering")
    );

    vscode.commands.executeCommand(
      "setContext",
      "tinkering:showButton",
      isPhp && inTinkeringFolder
    );
  };

  // update context saat editor berubah
  vscode.window.onDidChangeActiveTextEditor(updateButtonVisibility);

  // update context saat extension diaktifkan
  updateButtonVisibility(vscode.window.activeTextEditor);

  // Create folder & Playground file
  let initCmd = vscode.commands.registerCommand("tinkering.init", () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("Open a Laravel project first.");
      return;
    }

    const projectRoot = workspaceFolders[0].uri.fsPath;
    const tinkerDir = path.join(projectRoot, ".tinkering");

    if (!fs.existsSync(tinkerDir)) {
      fs.mkdirSync(tinkerDir);
    }

    const playgroundFile = path.join(tinkerDir, "playground.php");
    if (!fs.existsSync(playgroundFile)) {
      fs.writeFileSync(
        playgroundFile,
        "<?php\n\n // Write your Laravel Tinker code here\n // Press CTRL+ALT+R to Run \n\n"
      );
    }

    vscode.workspace.openTextDocument(playgroundFile).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  });

  // Register CodeLens provider for all PHP file on folder .tinkering
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "php", pattern: "**/.tinkering/**/*.php" },
      new PlaygroundCodeLensProvider()
    )
  );

  // Run Active File with Tinker
  let runCmd = vscode.commands.registerCommand("tinkering.run", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open.");
      return;
    }

    const filePath = editor.document.fileName;
    if (path.extname(filePath) !== ".php") {
      vscode.window.showErrorMessage(
        "Only PHP files can be run with Laravel Tinker."
      );
      return;
    }

    await editor.document.save();

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("Open a Laravel project first.");
      return;
    }

    const projectRoot = workspaceFolders[0].uri.fsPath;
    const config = vscode.workspace.getConfiguration("tinkering");
    const artisanPath = path.resolve(
      projectRoot,
      config.get("artisanPath") || "artisan"
    );

    if (!fs.existsSync(artisanPath)) {
      vscode.window.showErrorMessage("artisan file not found in project root.");
      return;
    }

    const tinkerDir = path.join(projectRoot, ".tinkering");
    if (!fs.existsSync(tinkerDir)) {
      fs.mkdirSync(tinkerDir);
    }

    let content = fs.readFileSync(filePath, "utf8");
    content = content.replace(/^<\?php\s*/, "").replace(/\?>\s*$/, "");
    const sqlListenerCode = `
    use Illuminate\\Support\\Facades\\DB;
    DB::listen(function ($query) {
        echo "---------------------------- \n";
        echo "[SQL] " . $query->sql . " \n[Bindings: " . implode(', ', $query->bindings) . "] \n[Time: " . $query->time . " ms]\\n";
        echo "---------------------------- \n";
    });
    `;
    const finalContent = sqlListenerCode + "\n" + content;

    const tmpFile = path.join(tinkerDir, "__tmp_run.php");

    fs.writeFileSync(tmpFile, finalContent);

    let terminal = vscode.window.terminals.find(
      (t) => t.name === "Laravel Tinker"
    );
    if (!terminal) {
      terminal = vscode.window.createTerminal("Laravel Tinker");
    }
    terminal.show();

    if (os.platform() === "win32") {
      const shell = vscode.env.shell.toLowerCase();
      if (shell.includes("powershell")) {
        terminal.sendText(`php "${artisanPath}" tinker < "${tmpFile}"`);
      } else {
        terminal.sendText(`type "${tmpFile}" | php "${artisanPath}" tinker`);
      }
    } else {
      terminal.sendText(`php "${artisanPath}" tinker < "${tmpFile}"`);
    }

    //Timeout for temp file
    setTimeout(() => {
      try {
        fs.unlinkSync(tmpFile);
      } catch {}
    }, 10000);
  });

  context.subscriptions.push(initCmd, runCmd);
}

export function deactivate() {}
