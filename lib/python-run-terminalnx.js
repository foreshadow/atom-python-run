/* global atom */
"use strict";

const path = require("path");
const child_process = require("child_process");

module.exports = {
    activate: () => {
        atom.commands.add("atom-text-editor", "Python run in terminal: run", run);
    },
    config: {
        a_terminal_selection: {
          title: "Select the Linux terminal emulator",
          description: "Linux terminal emulators supported are `gnome-terminal, konsole, xfce4-terminal, terminator, xterm and uxterm`",
          type: "string",
          default: "gnome-terminal"
        },
        command_line_arguments: {
          title: "Python Command Line Arguments",
          description: "Enter the arguments separated by the pipe symbol (|). For example: `this is a string|7|1.82|True`",
          type: "string",
          default: ""
        },
        disable_notifications: {
          title: "Disable notifications of success",
          description: "Disable notifications of saving and running",
          type: "boolean",
          default: false
        },
        disable_notifications_on_fail: {
          title: "Disable notifications of failure",
          description: "Disable notifications of extension name does not match",
          type: "boolean",
          default: false
        }
    }
};

function run() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    var file = editor.buffer.file;
    if (!file) {
        //if (!atom.config.get("python-run-terminalnx.disable_notifications_on_fail")) {
            atom.notifications.add("warning", "You have to create the file first.");
        //}
        return;
    }
    var supported_terminals = ["gnome-terminal", "konsole", "xfce4-terminal", "terminator", "xterm", "uxterm"];
    var sel_term = atom.config.get("python-run-terminalnx.a_terminal_selection");
    
    function isInArray(sup_terms, term) {
        return sup_terms.indexOf(term.toLowerCase()) > -1;
    }

    if (!(isInArray(supported_terminals, sel_term))) {
        atom.notifications.add("warning", sel_term + " is not a supported linux terminal.");
        return;
    } 
    
    if (!atom.config.get("python-run-terminalnx.disable_notifications")) {
        atom.notifications.add("info", "Saving...");
    }
    editor.save();
    var info = path.parse(file.path);
    if (info.ext != ".py") {
        if (!atom.config.get("python-run-terminalnx.disable_notifications_on_fail")) {
            atom.notifications.add("warning", info.base + " is not a .py file, exit.");
        }
        return;
    }
    if (!atom.config.get("python-run-terminalnx.disable_notifications")) {
        atom.notifications.add("info", "Running " + info.base + " ...");
    }

    var ex_op = "-x";
    var c_l_a = atom.config.get("python-run-terminalnx.command_line_arguments")
    if (sel_term != "gnome-terminal" && sel_term != "xfce4-terminal" && sel_term != "terminator") {
       var ex_op = "-e";
    }

    var child = child_process.spawn(sel_term, [
        ex_op, "/bin/sh", __dirname + "/../bin/run_python_code.sh", file.path, c_l_a
    ], {
        cwd: info.dir,
        detached: true
    });
    child.unref();
}
