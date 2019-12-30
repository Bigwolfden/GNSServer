# TechPrepServeR
## Dependencies
* [Node.js](https://nodejs.org/en/)
* [Yarn Package Manager](https://yarnpkg.com/en/)
## Installing
First clone the repository (with either ssh or https, the command uses ssh) and install the dependencies
```
git clone git@github.com:Bigwolfden/techprepserver.git
cd techprepserver
yarn
```
##Development
The server uses TypeScript and [ts-node](https://www.npmjs.com/package/ts-node) for development. Run the development server with
```
yarn dev
```
##Production
Transpile the TypeScript with
```
yarn build
```
and then run the server
```
yarn start
```