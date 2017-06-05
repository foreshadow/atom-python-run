#include "cplib.h"

const bool true = 1;
const bool false = 0;

void logs(const char * path, char * string) {
    FILE * file = fopen(path, "a");
    if (NULL == file)
    {
        fprintf(
            stderr,
            "Error: in logs() function...\npath: '%s'\nstring: '%s'\n",
            path, string
        );
        perror("Error");
        exit(1);
    }
    fputs(string, file);
    fclose(file);
}

void log_cp_version(const char * path, const char * version) {
    char string[BUFSIZ];
    sprintf(string, "Log: cp-executable version: %s\n", version);
    logs(path, string);
}

void log_exe_type(const char * path, const char * exe) {
    char string[BUFSIZ];
    sprintf(string, "Error: exe type: %s programs only =p\n", exe);
    logs(path, string);
}

void log_arg_tokens(const char * path, int argc, char ** argv) {
    char string[BUFSIZ];
    for (int index = 0; index < argc; index++) {
        sprintf(string, "Log: argv[%i]: '%s'\n", index, argv[index]);
        logs(path, string);
    }
}

void log_file_path(const char * path, const char * filename) {
    char string[BUFSIZ];
    sprintf(string, "Log: file path and name: '%s'\n", filename);
    logs(path, string);
}

void log_cmd_type(const char * path, const char * cmd) {
    char string[BUFSIZ];
    sprintf(string, "Log: cmd: '%s'\n", cmd);
    logs(path, string);
}

void log_file_read(const char * path, const char * filename) {
    char string[BUFSIZ];
    sprintf(string, "Error: file: '%s' is not readable.\n", filename);
    logs(path, string);
}

void log_system_type(const char * path) {
#ifdef _WIN32
    logs(path, "Log: system type: win32\n");
#elif __APPLE__
    logs(path, "Log: system type: darwin\n");
#elif __linux__
    logs(path, "Log: system type: linux\n");
#elif __unix__
    logs(path, "Log: system type: unix\n");
#else
    logs(path, "Log: system type: unknown\n");
#endif
}

void prompt(void) {
#ifdef _WIN32
    system("pause"); /*"Press any key to continue.\n"*/
#elif __APPLE__
    system("echo \"Close this window to continue...\"");
#else
    system("printf 'Press [ENTER] to continue...'; read _;");
#endif
}

bool is_readable_file(const char * filename) {
    FILE * file = fopen(filename, "r");
    if (NULL == file) {
        perror("Error");
        return false;
    }
    fclose(file);
    return true;
}

char * make_logpath(void) {
    char * logpath = malloc(BUFSIZ);
    #ifdef _WIN32
        sprintf(logpath, "%s\\.atom\\packages\\atom-python-run\\bin\\cp.log", getenv("USERPROFILE"));
    #else
        sprintf(logpath, "%s/.atom/packages/atom-python-run/bin/cp.log", getenv("HOME"));
    #endif
    return logpath;
}

char * make_filename(int argc, char **argv) {
    char * filename = malloc(BUFSIZ);
    memset(filename, '\0', BUFSIZ);
    for (int i = 2; i < argc; i++) {
        strcat(filename, argv[i]);
        if ((argc - 1) != i) {
            strcat(filename, " ");
        }
    }
    return filename;
}

char * make_command(const char * filename, char ** argv) {
    char * cmd = malloc(BUFFER);
    memset(cmd, '\0', BUFFER);
    strcat(cmd, argv[1]);
    strcat(cmd, " ");
    strcat(cmd, "\"");
    strcat(cmd, filename);
    strcat(cmd, "\"");
    return cmd;
}

int execute(const char * command) {
    int t = clock();
    int r = system(command); // origin command
    t = clock() - t;
    // output results to user
    printf(
        "\nProcess returned %d (0x%X)\texecution time : %.3f s\n",
        r, r, t / 1000.
    );
    return r;
}
