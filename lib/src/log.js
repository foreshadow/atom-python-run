/*
    CREATE A LOG OBJECT TO CAPTURE BASIC I/O OPERATIONS

    automate the logging process while executing in atom.

    create a Log object that prints I/O operations to standard output.

    this object prints all relavent information for inspecting basic I/O operations.

    this object should be used ONLY after spawn has executed and a tty instance has been created.
*/

class Log {
    constructor(object) {
        if (null == object) {
            this.defaultSetUp();
        } else {
            this.setUp(object);
        }
    }

    defaultSetUp() {
        this.setUp({
            'tty': null,
            'options': null,
            'args': null,
            'metadata': null
        });
    }

    setUp(object) {
        this.tty = object.tty;
        this.option = object.options;
        this.arg = object.args;
        this.object = object.metadata;
    }

    logMetaData() {
        console.log(
            `platform: ${process.platform}\n` +
            `has_a_tty:\n` +
            `shell: ${this.object.has_a_tty.shell}\n` +
            `option: ${this.object.has_a_tty.option}\n` +
            `call: ${this.object.has_a_tty.call}\n` +
            `script: ${this.object.has_a_tty.script}\n` +
            `command: ${this.object.has_a_tty.command(...this.arg)}\n`
        );
    }

    logParams() {
        console.log(
            "spawn_tty:\n" +
            `\toptions:\n${JSON.stringify(this.option, null, 4)}\n` +
            `\targs: ${[...this.arg]}\n`
        );
    }

    logTTY(tty) {
        this.tty.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        this.tty.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        this.tty.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    info() {
        this.logMetaData(this.object);
        this.logParams(this.option, ...this.arg);
        this.logTTY(this.tty);
    }
}

exports.log = new Log();
