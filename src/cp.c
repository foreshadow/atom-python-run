/*
    compiled as
        gcc -g -std=c99 -Wall cp.c -o cp
    Windows
        using mingw (Minature GNU for Windows) toolchain
        target win32
        gcc version 5.3.0 (GCC)
        not stripped
        NOTE: this cp.exe version should not require a local dll.
        if it does, it requires the MSVCRT.DLL

    Linux
        using gcc toolchain
        target x86_64-linux-gnu
        gcc version 5.4.0 20160609
        Ubuntu 5.4.0-6ubuntu1~16.04.4
        not stripped

    Mac OS X
        using clang toolchain target x_86_64-apple-darwin13.4.0
        Apple LLVM version 6.0 (clang-600.0.57) (based on LLVM 3.5svn)
        Mach-O 64-bit executable
        not stripped
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#ifndef BUFFER
#   define BUFFER 4096
#endif

typedef _Bool bool;

const bool true = 1;
const bool false = 0;

void logs(char * string);

void log_system_type(void);

void log_exe_type(const char * exe);

void log_arg_tokens(int index, char ** argv);

void log_last_element(int index);

void log_cmd_type(const char * exe, char * cmd);

void log_file_read(int index, char ** argv);

bool is_last_element(int index, int argc);

bool is_readable_file(int index, char **argv);

void system_command_read(void);

int main(int argc, char *argv[])
{
    char cmd[BUFFER];
    const char exe[] = "python";
    log_system_type();
    memset(cmd, '\0', sizeof(cmd));
    if (strncmp(exe, argv[1], strlen(exe))) {
        log_exe_type(exe);  // any version of python should execute
        return 1;
    }
    for (int i = 1; i < argc; i++) {
        log_arg_tokens(i, argv);
        if (is_last_element(i, argc) && is_readable_file(i, argv)) {
            log_last_element(i);
            strcat(cmd,"\"");
            strcat(cmd, argv[i]);
            strcat(cmd,"\"");
        } else {
            strcat(cmd, argv[i]);
            strcat(cmd, " ");
        }
    }
    int t = clock();
    int r = system(cmd); // origin command
    t = clock() - t;
    log_cmd_type(exe, cmd);
    printf(
        "\nProcess returned %d (0x%X)\texecution time : %.3f s\n",
        r, r, t / 1000.
    );
    system_command_read();
    return r;
}

/*
    i assume the last argument is always a file
    this can be modified to be less strict by removing is_readable_file() from the if clause
    example -> if (is_last_element(i, argc) && is_readable_file(i, argv))
*/
bool is_last_element(int index, int argc) {
    return ((argc - 1) == index) ? true: false;
}

bool is_readable_file(int index, char **argv) {
    FILE * fp;
    if (NULL == (fp = fopen(argv[index], "r"))) {
        log_file_read(index, argv);
        return false;
    }
    fclose(fp);
    return true;
}

void system_command_read(void) {
#ifdef _WIN32
    system("pause"); /*"Press any key to continue.\n"*/
#elif __APPLE__
    system("echo \"Close this window to continue...\"");
#else
    system("printf 'Press [ENTER] to continue...'; read _;");
#endif
}

void logs(char * string) {
    FILE * file = fopen("cp.log", "a+");
    if (NULL == file)
    {
        perror("Error");
        exit(1);
    }
    fputs(string, file);
    fclose(file);
}

void log_system_type(void) {
#ifdef _WIN32
    logs("System Type: win32\n");
#elif __APPLE__
    logs("System Type: macosx\n");
#elif __linux__
    logs("System Type: linux\n");
#elif __unix__
    logs("System Type: unix\n");
#else
    logs("System Type: unknown\n");
#endif
}

void log_exe_type(const char * exe) {
    char string[BUFSIZ];
    sprintf(string, "Error: I can only execute %s programs =p\n", exe);
    logs(string);
}

void log_arg_tokens(int index, char ** argv) {
    char string[BUFSIZ];
    sprintf(string, "Log: argv[%i] '%s'\n", index, argv[index]);
    logs(string);
}

void log_last_element(int index) {
    char string[BUFSIZ];
    sprintf(string, "Log: index [%i] is_last_element and is_readable_file\n", index);
    logs(string);
}

void log_cmd_type(const char * exe, char * cmd) {
    char string[BUFSIZ];
    sprintf(string, "Log: cmd '%s'\n", cmd);
    logs(string);
}

void log_file_read(int index, char ** argv) {
    char string[BUFSIZ];
    sprintf(string, "Error: I can't read the file '%s'.", argv[index]);
    logs(string);
}
