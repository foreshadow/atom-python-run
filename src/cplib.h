#ifndef cplib
#   define cplib

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#   ifndef BUFFER
#       define BUFFER 4096
#   endif

typedef _Bool bool;

void prompt(void);

bool is_readable_file(const char * filename);

char * make_filename(int argc, char **argv);

char * make_command(const char * filename, char ** argv);

char * make_logpath(void);

int execute(const char * command);

void logs(const char * path, char * string);

void log_cp_version(const char * path, const char * version);

void log_system_type(const char * path);

void log_exe_type(const char * path, const char * exe);

void log_arg_tokens(const char * path, int argc, char ** argv);

void log_file_path(const char * path, const char * filename);

void log_cmd_type(const char * path, const char * cmd);

void log_file_read(const char * path, const char * filename);
#endif
