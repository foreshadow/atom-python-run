/*
    compiled as
        gcc -g -std=c99 -Wall cp.c cplib.c -o cp-os-version

    Windows
        notes: using mingw (Minature GNU for Windows) toolchain
        target: win32
        compiler: gcc version 5.3.0 (GCC)
        file: PE32 executable (console) Intel 80386, for MS Windows
        symbols: not stripped
        NOTE: this cp.exe version should not require a local dll.
        if it does, it requires the MSVCRT.DLL

    Linux
        notes: using gcc toolchain
        target: x86_64-linux-gnu
        compiler: gcc version 5.4.0 20160609
        file: ELF 64-bit LSB executable, x86-64, dynamically linked, for GNU/Linux 2.6.32
        symbols: not stripped

    Mac OS X
        notes: using clang toolchain
        target: x86_64-apple-darwin13.4.0
        compiler: Apple LLVM version 6.0 (clang-600.0.57) (based on LLVM 3.5svn)
        file: Mach-O 64-bit x86_64 executable
        symbols: not stripped
*/
#include "cplib.h"

extern const bool true;
extern const bool false;

int main(int argc, char *argv[])
{
    // program to execute
    const char exe[] = "python";
    // dont execute unless arguments are present
    if (3 > argc) {
        fprintf(stderr, "Usage: %s %s [source-file]", argv[0], exe);
        return 2; // invalid arguments
    }
    // the logs (absolute) path and filename
    const char * logfile = make_logpath();
    // the python source file name
    const char * filename = make_filename(argc, argv);
    // concatenate param tokens to command
    // and init the command buffer
    const char * cmd = make_command(filename, argv);
    // keep the log file from becoming needlessly large in size
    remove(logfile);
    // start logging data
    log_file_path(logfile, logfile); // log the file path and name for log
    log_file_path(logfile, filename); // log the path to the python src file
    log_cmd_type(logfile, cmd); // log the command to be executed
    log_system_type(logfile); // log the systems information
    log_cp_version(logfile, "v0.7.3"); // cp version information
    log_arg_tokens(logfile, argc, argv); // log all the tokens
    // any version of python (and only python) should execute
    if (strncmp(exe, argv[1], strlen(exe))) {
        log_exe_type(logfile, exe);
        return 4; // invalid command type
    }
    // attempt to read the source file before executing it
    if (false == is_readable_file(filename)) {
        log_file_read(logfile, filename);
        return 8; // failed to read source file
    }
    // time the execution
    int r = execute(cmd);
    // pause screen according to os type
    prompt();
    // return the child process exit code
    return r;
}
