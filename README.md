# Bill-Generator
BILL GENERATOR WEB + API BACKEND.

© 2022 Bill Generator.

### Version info
node    : v14.18.1
npm     : 6.14.15
eslint  : 8.0.1
express : 4.16.1

### To install dependencies
```sh
$ npm install
```

### To start server in dev mode
```sh
$ npm run dev
```
### To stop server in dev mode
```sh
$ Ctrl + c
```

### To start server in prod mode
Login to hosted server and navigate to project path.
CMD: cd /var/www/bill_generator
then run hit the shell CMD to run server in background.
```sh
$ NODE_ENV=production forever start bin/www
```

### To stop server in prod mode
```sh
$ forever stop 0
```

### Additional code-format with eslint setup

1) Add extension on IDE (VS-Code) first.
   Name:  ESLint -- publisher ["Dirk Baeumer"]
   extension ID:  dbaeumer.vscode-eslint

2) install dev dependencies
```sh
$  npm install --only=dev
```