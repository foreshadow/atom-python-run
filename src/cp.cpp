#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

int main(int argc, char *argv[])
{
    char cmd[4096];
    strcpy(cmd, "title "); // prepend title
    for (int i = 1; i < argc; i++) {
        strcat(cmd, argv[i]);
        strcat(cmd, " ");
    }
    system(cmd); // reset title
    int t = clock();
    int r = system(cmd + 6); // origin command
    t = clock() - t;
    printf("\n"
           "Process returned %d (0x%X)   execution time : %.3f s\n"
           /*"Press any key to continue.\n"*/,
        r, r, t / 1000.);
    system("pause");
    return r;
}
