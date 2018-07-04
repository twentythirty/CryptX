#!/bin/bash
ESC_SEQ="\x1b["
COL_RESET=$ESC_SEQ"39;49;00m"
COL_GREEN=$ESC_SEQ"32;01m"
COL_MAGENTA=$ESC_SEQ"35;01m"
COL_RED=$ESC_SEQ"31;01m"

script=`basename $0`

if [ $# -ne 2 ]
then
    echo -e $COL_RED"Usage: $script config_env_name heroku_app"$COL_RESET
else
    echo -e $COL_GREEN"Setting up env:$1 on heroku:$2"$COL_RESET
    vars=$(cat .env-$1)
    command="heroku config:set $vars -a $2"

    echo $command
    eval $command
fi
