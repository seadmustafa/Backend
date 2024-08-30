# 🚀 Getting started with Strapi

## Prerequisites

- [Strapi](https://strapi.io) - latest
- [NPM](https://www.npmjs.com/get-npm) - latest
- [Yarn](https://www.npmjs.com/get-npm) - latest
- [nvm](https://github.com/AleRapchan/private-data-collections-on-fabric/blob/master) - latest
- [Node.js](https://nodejs.org/en/download/) - Node v20.x.x
- [Git client](https://git-scm.com/downloads) - latest

## How to run project

It's easy, just follow these steps:

**Make environment file**

Create a new `.env` file

```sh
cp .env.example .env
```

Open this file using `vim` or your text editor of choice:

```sh
vim .env
```

The current `.env` file. We need to update the variables.

Save the file when you’re done editing. If you used `vim`, you can do that by pressing `ESC`, then `:wq` and `Enter` to confirm.

**Start developing with**

Step 1: Install packages

```sh
npm install
# or
yarn install
```

Step 2: Start your Strapi application with autoReload enabled.

```sh
npm run develop
# or
yarn develop
```

**Start production with**

Step 1: Install packages

```sh
npm install
# or
yarn install
```

Step 2: Build your admin panel.

```sh
npm run build
# or
yarn build
```

Step 3: Start your Strapi application with autoReload disabled.

```sh
npm run start
# or
yarn start
```

Go to result <http://localhost:9090/>

Go to api document <http://localhost:9090/api-docs>


## Coding convention

Use the <https://prettier.io>

You can now run command line to check coding format:

```sh
npm run format:check
# or
yarn run format:check
```

You can now run command line to fix coding format:

```sh
npm run format:write
# or
yarn run format:write
```

Use the <https://eslint.org>

You can now run command line to check coding convention:

```sh
npm run lint:check
# or
yarn run lint:check
```

You can now run command line to fix coding convention:

```sh
npm run lint:fix
# or
yarn run lint:fix
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.


## License

Strapi is [MIT licensed](https://github.com/strapi/strapi/blob/develop/LICENSE).

From Developers
Made with ❤️ by Amela team
