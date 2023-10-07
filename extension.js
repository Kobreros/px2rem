const vscode = require("vscode");

function activeLineNumber() {
  const editor = vscode.window.activeTextEditor;
  return editor.selection.active.line;
}

function getStartPosition() {
  return new vscode.Position(activeLineNumber(), 0);
}

function getEndPosition() {
  return new vscode.Position(activeLineNumber(), Number.MAX_VALUE);
}

function getActiveLineRange() {
  const startPosition = getStartPosition();
  const endPosition = getEndPosition();
  return new vscode.Range(startPosition, endPosition);
}

let decorationType = null;

function showDecoration(calculatedValue, baseWidth) {
  if (calculatedValue === 0) return;

  const editor = vscode.window.activeTextEditor;
  if (decorationType != null) {
    decorationType.dispose();
  }
  decorationType = vscode.window.createTextEditorDecorationType({
    // backgroundColor: "green",
    // border: "2px solid white",
    after: {
      contentText: `${calculatedValue}, width ${baseWidth}`,
      margin: "0px 0px 0px 20px",
      color: "rgba(255, 255, 255, 0.5)",
    },
  });

  const decorationOptions = [
    {
      range: getActiveLineRange(),
    },
  ];
  editor.setDecorations(decorationType, decorationOptions);
}

function calculatePxToRem() {
  const editor = vscode.window.activeTextEditor;
  const currentLine = editor.document.lineAt(activeLineNumber());
  const currentPxValue = currentLine.text.match(/(\d+px)/g);

  if (currentPxValue) {
    const baseWidth = vscode.workspace
      .getConfiguration("px2rem")
      .get("baseWidth", 1440);

    const remValue =
      ((parseFloat(currentPxValue[0]) / baseWidth) * 100).toFixed(2) || 0;

    const newLine = currentLine.text.replace(
      currentPxValue[0],
      remValue + "rem"
    );

    return { remValue, newLine };
  } else if (decorationType != null) {
    decorationType.dispose();
    return { remValue: 0, newLine: currentLine.text };
  }
}

function replaceLine(newLine) {
  const editor = vscode.window.activeTextEditor;
  editor.edit((edit) => edit.replace(getActiveLineRange(), newLine));
}

function activate(context) {
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "px2rem" is now active!');

  let px2rem = vscode.commands.registerCommand("px2rem.convert", function () {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    // vscode.window.showInformationMessage("Hello World from px2rem!");

    replaceLine(calculatePxToRem().newLine);
  });

  let changeBaseWidth = vscode.commands.registerCommand(
    "px2rem.updateBaseWidth",
    function () {
      vscode.window
        .showInputBox({ prompt: "Enter new base width" })
        .then((newValue) => {
          vscode.workspace
            .getConfiguration("px2rem")
            .update("baseWidth", +newValue, vscode.ConfigurationTarget.Global);
        });
    }
  );

  let updateDecoration = vscode.window.onDidChangeTextEditorSelection(() => {
    const result = calculatePxToRem();
    if (result) {
      showDecoration(
        result.remValue,
        vscode.workspace.getConfiguration("px2rem").get("baseWidth", 1440)
      );
    } else {
      if (decorationType != null) {
        decorationType.dispose();
      }
    }
  });

  context.subscriptions.push(px2rem, changeBaseWidth, updateDecoration);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
