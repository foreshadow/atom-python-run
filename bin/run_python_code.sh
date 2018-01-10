#!/bin/bash
oldIFS=$IFS
IFS=''
arg_l_c=()
IFS="|" read -a la <<< "$2";
for ((i = 0; i < ${#la[@]}; ++i)) do
    if [ "${la[i]}" != "" ]; then
        if [ "${la[i]}" == "_-:ON PAUSE:-_" ] || [ "${la[i]}" == "_-:OFF PAUSE:-_" ]; then
          do_pause="${la[i]}"
        else
          arg_l_c+=("${la[i]}")
        fi
    fi
done

python "$1" ${arg_l_c[@]}

if [ $? -eq 0 ]; then
    echo -e "

\e[1;36m=================================
(The program exited with code: $?)\e[0m"
else
    echo -e "

\e[1;31m=================================
(The program exited with code: $?)\e[0m"
fi
if [ "$do_pause" == "_-:ON PAUSE:-_" ]; then
  read -rsp $'Press any key to continue...\n' -n 1 key
fi
IFS=$old_IFS
