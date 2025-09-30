#!/bin/bash

if [[ $# -eq 1 ]]; then
  tickers=$@
else
  tickers=$(sqlite3 sqlite.db "select distinct ticker from investments;")
fi

date=$(date)
name="$(echo ${ticker} | tr ":\-" "_")"

for ticker in ${tickers[@]}; do
  curl -o scraper/${name}.txt "https://www.google.com/finance/quote/${ticker}"
  printf "\n${date}" >> scraper/${name}.txt
  price=$(rg data-last-price scraper/${name}.txt | sed -E 's/.*data-last-price=[^\$]*\$([0-9,]+\.[0-9]+).*/\1/' | tr -d ',')
  currency=$(rg data-currency-code scraper/${name}.txt | sed -E 's/.*data-currency-code=\"([a-zA-Z]+)\".*/\1/')

  if [[ "${#price}" -ge 1 ]]; then
    echo "${date}: [${ticker}] SUCCESS" >> scraper/log.txt
    pnpm tsx scraper/insert.ts "${date}" "${ticker}" "${currency}" "${price}" "google_finance"
  else
    echo "${date}: [${ticker}] ERROR" >> scraper/log.txt
    echo "ERROR: Invalid ticker symbol"
  fi
  rm scraper/${name}.txt
  sleep 5
done

exit 0
