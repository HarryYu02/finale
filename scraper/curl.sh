#!/bin/bash

if [[ $# -eq 1 ]]; then
  ticker=$1
else
  ticker="VFV:TSE"
fi

date=$(date)
name="$(echo ${ticker} | tr ":\-" "_")"

curl -o scraper/${name}.txt "https://www.google.com/finance/quote/${ticker}"
printf "\n${date}" >> scraper/${name}.txt
price=$(rg data-last-price scraper/${name}.txt | sed -E 's/.*data-last-price=[^\$]*\$([0-9,]+\.[0-9]+).*/\1/' | tr -d ',')
currency=$(rg data-currency-code scraper/${name}.txt | sed -E 's/.*data-currency-code=\"([a-zA-Z]+)\".*/\1/')

if [[ "${#price}" -ge 1 ]]; then
  echo "${date}: SUCCESS" >> scraper/log.txt
  pnpm tsx scraper/insert.ts "${date}" "${ticker}" "${currency}" "${price}" "google_finance"
else
  echo "${date}: ERROR" >> scraper/log.txt
  echo "ERROR: Invalid ticker symbol"
  rm scraper/${name}.txt
  exit 1
fi

exit 0

