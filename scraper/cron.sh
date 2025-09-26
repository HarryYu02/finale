#!/bin/bash

dir=$(pwd)
crontab -l > crontab_new
echo "0 0 * * * cd ${dir} && ${dir}/scraper/curl.sh" >> crontab_new
crontab crontab_new
rm crontab_new
