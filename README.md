# Finale

My endgame double entry ledger for personal **fin**ance using journ**al** **e**ntries.

> See what I did there?

## Inspiration

I have always used a simple income/expense spreadsheet to track my finances.
But there are some pain points that bothers me:

- Hard to keep track of account transfers, including paying off cc bills etc..
- Hard to keep track of bill spliting, should I classify it as a repayment?
  So is it an income?
- Adding an entry is extremely repetitive, later I use Google Sheet
  (Appscript) to automate it, but that introduce another problem.
- I don't want to put my financial data on Google
  nothing personal, just preference.

I have tried some well made apps on the market as well,
but they are either bundled with a lot of features I don't need,
or is paid (I am cheap). So I decided to make my own.

The goals:

1. Accurate
2. Intuitive
3. Local
4. Tailor made

## Prequisite

1. Node >= 22

I think that's it.

## Set up

Mind the app is meant to run on your local machine,
in a random tmux session and be forgotten,
If you want, feel free to self-host it and use it on your phone,
do whatever you like.

1. Clone the repo:

```bash
git clone https://github.com/HarryYu02/finale.git
```

2. Install the dependencies, I use pnpm here as I don't want my $0.50 btc stolen:

```bash
cd finale
pnpm install
```

3. Create your .env, all variables needed are in src/env/schema.ts

```bash
touch .env
```

An example:

```bash
DATABASE_URL=sqlite.db
BETTER_AUTH_SECRET=verysecuredpasswordpotatohashed
BETTER_AUTH_URL=http://localhost:3000
SERVER_URL=http://localhost:3000
```

4. Migrate the Sqlite db:

```bash
pnpm db:migrate
```

5. Run the dev server:

```bash
pnpm dev
```

## Development

Here are a non-exhausive list of library I used / docs that might be helpful:

- [SolidStarter](https://github.com/HarryYu02/solid-starter)
- [SolidStart](https://docs.solidjs.com/solid-start/)
- [DrizzleORM](https://orm.drizzle.team/docs/overview)
- [BetterAuth](https://www.better-auth.com/docs/introduction)
- [Biome](https://biomejs.dev/guides/getting-started/)
- [Tailwindcss](https://tailwindcss.com/docs/installation/using-vite)
- [KobalteUI](https://kobalte.dev/docs/core/overview/introduction)
- [SolidUI](https://www.solid-ui.com/docs/introduction)
- [Zod](https://zod.dev/)
- [Tanstack-form](https://tanstack.com/form/latest/docs/overview)

## Contributions

Honestly, as the app is highly customized to myself,
I strongly recommend just fork it and adjust it to your own likings.
But any sort of contributions / recommendations are welcomed!
Really, do whatever you like, I couldn't care less.

## License

This app is FOSS and licensed under the MIT License.
