// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

function addMargin(Text: string, Tab: number) {
    let len = Text.length;
    let tgt_len = Tab * 4;
    if (tgt_len < len) {
        tgt_len = (Math.floor(len / 4) + 1) * 4;
    }
    let ret = Text + " ".repeat(tgt_len - len);
    return ret;
}
function addMarginOffset(Text: string, Offset: number) {
    let len = Text.length;
    let tgt_len = (Math.floor(len / 4) + Offset) * 4;
    let ret = Text + " ".repeat(tgt_len - len);
    return ret;
}
function getWord(Line: string) {
    let ret = "";
    let reg_word = /^\s*([^\s\[;,]+)\s*/;
    let match = reg_word.exec(Line);
    if (match !== null) {
        ret = match[1];
        Line = Line.replace(match[0], "");
        return [Line, ret];
    } else {
        let reg_BW = /^\s*(\[\s*[^:]+:[^\]]+\])/;
        let match2 = reg_BW.exec(Line);
        if (match2 !== null) {
            ret = match2[1];
            Line = Line.replace(match2[0], "");
            return [Line, ret];
        }
    }
    return [Line, ret];
}
function parseLine(InLine: string) {
    let tab = 1;
    let new_line = "";

    let types = ["input", "output", "inout", "wire", "reg", "signed", "parameter", "localparam", "genvar", "integer"];

    let reg_cmt = /^\s*\/\//;
    let match = reg_cmt.exec(InLine);

    if (match !== null) {
        //is Comment Line
        return InLine;
    }

    let [Line, word] = getWord(InLine);

    if (types.indexOf(word) > -1) {
        //Define Line Handling
        new_line = addMargin(new_line, tab) + word;
        [Line, word] = getWord(Line);

        if (types.indexOf(word) > -1) {
            //Sub Type
            new_line = addMargin(new_line, 3) + word;
            [Line, word] = getWord(Line);
        }
        if (word.match(/\[/)) {
            //Bit Field Handling
            new_line = addMargin(new_line, 5) + word;
            [Line, word] = getWord(Line);
        }

        //Name Of Signal
        new_line = addMargin(new_line, 14) + word;

        //Other Line Handling
        if (!Line.match(/^\s+$/)) {
            new_line = addMarginOffset(new_line, 1) + Line;
        }
    } else if (InLine.match(/<*=/)) {
        let reg_rvalue = /<*=[^=].*$/;
        let rvalue = reg_rvalue.exec(InLine);
        if (rvalue) {
            let lvalue = InLine.replace(rvalue[0], "");
            new_line = addMarginOffset(lvalue, 1) + rvalue[0];
        }
    } else {
        new_line = InLine;
    }
    return new_line;
}

function parseLine_2(InLine: string) {
    let new_line = "";

    let reg_cmt = /^\s*\/\//;
    let match = reg_cmt.exec(InLine);

    if (match !== null) {
        //is Comment Line
        return InLine;
    }

    let [Line, word] = getWord(InLine);
    new_line = word;
    if (InLine.match(/<*=/)) {
        let reg_tgt = /\S+\s*<*=.*$/;
        let tgt = reg_tgt.exec(InLine);
        if (tgt) {
            Line = InLine.replace(tgt[0], "");
            new_line = addMarginOffset(Line, 1) + tgt[0];
        }
    } else {
        new_line = InLine;
    }

    return new_line;
}

function verilog_mode(mode: Number) {
    let file_path = vscode.window.activeTextEditor?.document.uri.fsPath;
    var my_term   = vscode.window.activeTerminal;
    if(typeof my_term === 'undefined') { my_term = vscode.window.createTerminal(); }
    my_term.show();

    if(mode === 0) {// Verilog Auto
        let cmd = 'emacs --batch \'' + file_path + '\' -f verilog-batch-auto -f save-buffer';
        console.log(cmd);
        my_term.sendText(cmd);
    }
    else if(mode === 1) { //verilog-delete-auto
        let cmd = 'emacs --batch \'' + file_path + '\' -f verilog-batch-delete-auto -f save-buffer';
        console.log(cmd);
        my_term.sendText(cmd);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "verilog-autoline" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("extension.VerilogAutoline", () => {
        // The code you place here will be executed every time your command is executed

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let range = 1;
        let ln_st = 0;
        let sel = editor.selection;
        var paragraph = "";
        if (sel.isEmpty) {
            range = 1;
            ln_st = editor.selection.active.line;
        } else {
            range = sel.end.line - sel.start.line + 1;
            ln_st = sel.start.line;
        }

        for (var i = 0; i < range; i++) {
            let line = editor.document.lineAt(ln_st + i);
            let line_text = line.text;
            let new_line = parseLine(line_text);
            if (new_line !== null) {
                if (i !== 0) {
                    paragraph = paragraph + "\n";
                }
                paragraph = paragraph + new_line;
                // editor.edit(builder => {
                //     builder.replace(line.range, new_line);
                // });
            }
        }
        var last_line = editor.document.lineAt(sel.end.line);
        var text_Range = new vscode.Range(ln_st, 0, sel.end.line, last_line.range.end.character);
        editor.edit(builder => {
            builder.replace(text_Range, paragraph);
        });
        var position = editor.selection.active;
        var newPosition = position.with(position.line, 0);
        var newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    });

    context.subscriptions.push(disposable);

    let disposable2 = vscode.commands.registerCommand("extension.VerilogAutoline2", () => {
        // The code you place here will be executed every time your command is executed

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let range = 1;
        let ln_st = 0;
        let sel = editor.selection;
        var paragraph = "";
        if (sel.isEmpty) {
            range = 1;
            ln_st = editor.selection.active.line;
        } else {
            range = sel.end.line - sel.start.line + 1;
            ln_st = sel.start.line;
        }

        for (var i = 0; i < range; i++) {
            let line = editor.document.lineAt(ln_st + i);
            let line_text = line.text;
            let new_line = parseLine_2(line_text);
            if (new_line !== null) {
                if (i !== 0) {
                    paragraph = paragraph + "\n";
                }
                paragraph = paragraph + new_line;
                // editor.edit(builder => {
                //     builder.replace(line.range, new_line);
                // });
            }
        }
        var last_line = editor.document.lineAt(sel.end.line);
        var text_Range = new vscode.Range(ln_st, 0, sel.end.line, last_line.range.end.character);
        editor.edit(builder => {
            builder.replace(text_Range, paragraph);
        });

        var position = editor.selection.active;
        var newPosition = position.with(position.line, 0);
        var newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    });

    context.subscriptions.push(disposable2);

    let vim_fold = vscode.commands.registerCommand("extension.VimFoldAdd", () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let sel = editor.selection;
        if (sel.isEmpty) {
            return;
        }
        let range = sel.end.line - sel.start.line + 1;
        let ln_st = sel.start.line;
        var paragraph = "";
        for (var i = 0; i < range; i++) {
            let line = editor.document.lineAt(ln_st + i).text;
            if (i === 0) {
                line = line + "    /*{{{*/";
            } else if (i === range - 1) {
                line = line + "    /*}}}*/";
            }
            paragraph = paragraph + line + "\n";
        }
        var last_line = editor.document.lineAt(sel.end.line);
        var text_Range = new vscode.Range(ln_st, 0, sel.end.line, last_line.range.end.character);
        editor.edit(builder => {
            builder.replace(text_Range, paragraph);
        });
    });
    context.subscriptions.push(vim_fold);

    let vmode_auto = vscode.commands.registerCommand("extension.VerilogAuto", () => {verilog_mode(0);});
    context.subscriptions.push(vmode_auto);
    let vmode_delete_auto = vscode.commands.registerCommand("extension.VerilogDeleteAuto", () => {verilog_mode(1);});
    context.subscriptions.push(vmode_delete_auto);
}
// this method is called when your extension is deactivated
export function deactivate() {}
