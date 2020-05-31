# make file

generate:
	deno run -A --unstable pkger.ts --include=./example --out=./dist

test:
	deno test -A --unstable