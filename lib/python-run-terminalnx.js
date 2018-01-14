/* global atom */
"use strict";

const path = require("path");
const child_process = require("child_process");

module.exports = {
    activate: () => {
        atom.commands.add("atom-text-editor", "Python run in a command line terminal: run", run);
    },
    config: {
      a_terminal_selection: {
        title: "Select the command line terminal",
        description: "For Windows, select `cmd` and for Linux, select the compatible terminal emulators like `gnome-terminal, konsole, xfce4-terminal, deepin-terminal or terminator`",
        type: "string",
        default: "cmd",
        enum: [
          {value: 'cmd', description: 'cmd. Windows command line interpreter'},
          {value: 'gnome-terminal', description: 'gnome-terminal. Terminal emulator for GNOME Desktop Environment'},
          {value: 'konsole', description: 'konsole. Terminal emulator for KDE Desktop Environment'},
          {value: 'xfce4-terminal', description: 'xfce4-terminal. Terminal emulator for XFCE Desktop Environment'},
          {value: 'deepin-terminal', description: 'deepin-terminal. Terminal emulator for Deepin Desktop Environment'},
          {value: 'terminator', description: 'terminator. Terminal emulator for any Desktop Environment'}
        ]
      },
      b_pause: {
          title: 'Pause',
          description: 'Show a pause at the finish of program execution',
          type: 'boolean',
          default: true
      },
      command_line_arguments: {
        title: "Python Command Line Arguments",
        description: "Enter the arguments separated by the pipe symbol (|). For example: `this is a string|7|1.82|True`",
        type: "string",
        default:""
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
        atom.notifications.add("warning", "You have to create the file first.");
        return;
    }

    var sel_term = atom.config.get("python-run-terminalnx.a_terminal_selection");
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
    var c_l_a = atom.config.get("python-run-terminalnx.command_line_arguments")
    var b_pause =  atom.config.get("python-run-terminalnx.b_pause")

    if (b_pause){
      c_l_a += "|" + "_-:ON PAUSE:-_";
    }else{
      c_l_a += "|" + "_-:OFF PAUSE:-_";
      atom.notifications.add("warning", "Running the program without pause at the end.");
    }
    if ('win32' === process.platform) {
        var n_c_l_a = c_l_a.replace(/\|/g, ":@:");
        var child = child_process.spawn(sel_term, [
            "/S", "/C", "start", __dirname + "\\..\\bin\\run_python_code.bat", file.path, n_c_l_a
        ]);
        child.on('error', function(err) {
          atom.notifications.add("error", sel_term + " is not a command line terminal installed in the system.");
        });
        child.unref();
    } else if ('linux' === process.platform) {
        var ex_op = "-x";
        if (sel_term != "gnome-terminal" && sel_term != "xfce4-terminal" && sel_term != "terminator") {
           var ex_op = "-e";
        }
        var child = child_process.spawn(sel_term, [
            ex_op, "/bin/bash", __dirname + "/../bin/run_python_code.sh", file.path, c_l_a
        ], {
            cwd: info.dir,
            detached: true
        });
        child.on('error', function(err) {
          atom.notifications.add("error", sel_term + " is not a command line terminal installed in the system.");
        });
        child.unref();
    } else {
      atom.notifications.add("error", process.platform + " is not a supported operating system.");
    }
}
