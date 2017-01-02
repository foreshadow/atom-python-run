#!/bin/sh
oldIFS=$IFS
IFS=''
arg_l_c=()
IFS="|" read -a la <<< "$2";
for ((i = 0; i < ${#la[@]}; ++i)) do
    if [ "${la[i]}" != "" ]; then
        arg_l_c+=("${la[i]}")
    fi
done

python "$1" ${arg_l_c[@]}

if [ $? -eq 0 ]; then
    echo -e "

\e[1;34m=================================
(The program exited with code: $?)\e[0m"
else
    echo -e "

\e[1;31m=================================
(The program exited with code: $?)\e[0m"
fi

echo "Press return to continue"
dummy_var=""
read dummy_var
IFS=$old_IFS
