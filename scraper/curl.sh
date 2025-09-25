#!/bin/bash

if [[ $# -eq 1 ]]; then
  ticker=$1
else
  ticker="VFV:TSE"
fi

date=$(date)
curl -o scraper/out.txt "https://www.google.com/finance/quote/${ticker}"
printf "\n${date}" >> scraper/out.txt
price=$(rg data-last-price scraper/out.txt | sed -E 's/.*data-last-price[^\$]*\$([0-9,]+\.[0-9]+).*/\1/' | tr -d ',')
currency=$(rg data-currency-code scraper/out.txt | sed -E 's/.*data-currency-code=\"([a-zA-Z]+)\".*/\1/')

if [[ "${#price}" -ge 1 ]]; then
  pnpm tsx scraper/insert.ts "${date}" "${ticker}" "${currency}" "${price}"
else
  echo "ERROR"
fi


