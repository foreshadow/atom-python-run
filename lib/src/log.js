
let log_type_info = function (object) {
    console.log(`platform: ${process.platform}\n`);
    console.log(`has_a_tty:\n\tshell: ${object.has_a_tty.shell}\n`);
    console.log(`\toption: ${object.has_a_tty.option}\n`);
    console.log(`\tcall: ${object.has_a_tty.call}\n`);
    console.log(`\tscript: ${object.has_a_tty.script}\n`);
    if ("darwin" === process.platform) {
        console.log(`\tcommand: ${object.has_a_tty.command(...args)}\n`);
    }
};


let log_param_info = function (options, ...args) {
    console.log(
        "spawn_tty:\n" +
        `\toptions:\n${JSON.stringify(options, null, 4)}\n` +
        `\targs: ${[...args]}\n`
    );
};


let log_tty_info = function (tty) {
    tty.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    tty.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
    tty.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
};


let has_a_log = function (tty, options, ...args) {
    log_type_info(this);
    log_param_info(options, ...args);
    log_tty_info(tty);
};


exports.has_a_log = has_a_log;
