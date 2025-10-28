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
  price=$(\
    rg data-last-price scraper/${name}.txt |\
    sed -E 's/.*data-last-price=[^\$]*\$([0-9,]+\.[0-9]+).*/\1/' |\
    tr -d ','\
  )
  currency=$(rg data-currency-code scraper/${name}.txt | sed -E 's/.*data-currency-code=\"([a-zA-Z]+)\".*/\1/')

  if [[ "${#price}" -ge 1 ]]; then
    price_cents=$(echo "$price * 100 / 1" | bc)
    sqlite3 sqlite.db \
      "insert into stock_prices (ticker, currency, price, provider) values ('${ticker}', '${currency}', '${price_cents}', 'google_finance');"
    echo "${date}: [${ticker}] SUCCESS" >> scraper/log.txt
  else
    echo "${date}: [${ticker}] ERROR" >> scraper/log.txt
  fi
  rm scraper/${name}.txt
  sleep 5
done

exit 0
