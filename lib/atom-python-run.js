"use strict";

var child_process = require("child_process");
var path = require("path");

module.exports = {
    activate: () => {
        atom.commands.add("atom-text-editor", "Python run: run", run);
    }
};

function run() {
    var file = atom.workspace.getActiveTextEditor().buffer.file.path;
    var info = path.parse(file);
    if (info.ext != ".py") {
        return;
    }
    var editor = atom.workspace.getActiveTextEditor();
    if (editor) {
        editor.save();
    }
    atom.notifications.add("info", "Running " + info.name + ".py ...");
    var child = child_process.spawn("cmd", ["/c start python " + info.name + ".py"]);
    child.on("close", (code) => {
        if (code == 0) {
            atom.notifications.add("success", info.name + ".py exited with code " + code + ".");
        } else {
            atom.notifications.add("warning", info.name + ".py exited with code " + code + ".");
        }
    });
}
