#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

int main(int argc, char *argv[])
{
    char cmd[1024];
    for (int i = 1; i < argc; i++) {
        strcat(cmd, argv[i]);
        strcat(cmd, " ");
    }
    int t = clock();
    int r = system(cmd);
    t = clock() - t;
    printf("\n"
           "Process returned %d (0x%X)   execution time : %.3f s\n"
           "Press any key to continue.\n", 
        r, r, t / 1000.);
    fflush(stdin);
    getchar();
    return r;
}
