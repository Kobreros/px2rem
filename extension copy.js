const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "px2rem" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let px2rem = vscode.commands.registerCommand("px2rem.convert", function () {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from px2rem!");

    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;

    const currentLine = editor.document.lineAt(selection.active.line);
    const currentPxValue = currentLine.text.match(/(\d+px)/g);

    if (currentPxValue) {
      const baseWidth = vscode.workspace
        .getConfiguration("px2rem")
        .get("baseWidth", 1440);

      const remValue = (
        (parseFloat(currentPxValue[0]) / baseWidth) *
        100
      ).toFixed(2);
      const newLine = currentLine.text.replace(
        currentPxValue[0],
        remValue + "rem"
      );

      editor.edit((edit) => edit.replace(currentLine.range, newLine));
    }
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
          console.log("newValue :>> ", newValue);
        });
    }
  );

  context.subscriptions.push(px2rem, changeBaseWidth);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
