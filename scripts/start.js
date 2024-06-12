"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

// Ensure environment variables are read.
require("../config/env");

const fs = require("fs");
const fsExtra = require('fs-extra')

const path = require("path");
const chalk = require("react-dev-utils/chalk");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const clearConsole = require("react-dev-utils/clearConsole");
const checkRequiredFiles = require("react-dev-utils/checkRequiredFiles");
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require("react-dev-utils/WebpackDevServerUtils");
const openBrowser = require("react-dev-utils/openBrowser");
const semver = require("semver");
const paths = require("../config/paths");
const configFactory = require("../config/webpack.config");
const createDevServerConfig = require("../config/webpackDevServer.config");
const getClientEnvironment = require("../config/env");
const react = require(require.resolve("react", { paths: [paths.appPath] }));

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

const currentDirectory = process.cwd();
const rootDir = path.resolve(__dirname, "../");

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow("https://cra.link/advanced-config")}`
  );
  console.log();
}

function walkDir(dir, callback) {
  let files = fs.readdirSync(dir);
  files.forEach((file) => {
    let fullPath = path.join(dir, file);
    const stats =  fs.statSync(fullPath)
    if (stats.isDirectory() && file !== "node_modules" && file !== "_pugins") {
      callback(fullPath, file);
      walkDir(fullPath, callback); // 递归遍历子目录
    }
  });
}

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require("react-dev-utils/browsersHelper");
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then((port) => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    const name = "pugins";
    // 生成插件文件
    // path.resolve(rootDir, `./${name}`)
    const puginsDirs = [];
    walkDir(rootDir, (dir, dirFileName) => {
      // 上级目录已创建过
      const hasCreated = puginsDirs.find((d) => {
        return dir.includes(d);
      });

      if (
        !dirFileName.includes(name) ||
        dirFileName.startsWith("_") ||
        hasCreated
      )
        return;
      console.log("Directory:", dir);

      const _pugins = path.join(dir, `./_${name}`);

      if( fs.existsSync(_pugins)){
        fsExtra.removeSync(_pugins)
      }


      // 符合条件在当前目录下创建文件夹
      fs.mkdir(_pugins, { recursive: true }, (err) => {
        if (err) throw err;
        const puginList = [];
        // 在当前插件目录下生成插件内容
        walkDir(dir, (puginsDir, puginsDirName) => {
          const curMindexTs = path.join(puginsDir, "index.ts");
          const curMindexTsx = path.join(puginsDir, "index.tsx");
          const curManifest = path.join(puginsDir, "manifest.json");
          
          const isExistTs =   fs.existsSync(curMindexTs)
          const isExistTsx = fs.existsSync(curMindexTsx)
          const isExistManifest  =  fs.existsSync(curManifest)

          console.log(isExistTs,'a')
          console.log(isExistTsx,'b')
          console.log(isExistManifest,'c')
          if ((isExistTs || isExistTsx) && isExistManifest) {
            console.log('tttt')

          // if (true) {
            // const classPaht = curMindexTsx
            const classPaht = isExistTs ? curMindexTs : curMindexTsx
            const alisNameIndex = '@root/src' + classPaht.split('src')[1]
            const alisNameClass = '@root/src' + curManifest.split('src')[1]
            puginList.push({
              scheme: ` await import('${alisNameIndex}')`,
              class: ` await import('${alisNameClass}')`,
            });
          }
        });

        console.log(puginList,'list')
        let str = ''
        puginList.forEach(d=>{
          str += `{'scheme' : ${d.scheme},
                  'class' : ${d.class} },
                `
        })
        const content = `
            const pg = [${str.replace(/\s+/g," ")}]
            export default pg
          `;

        fs.writeFile(`${_pugins}/index.ts`, content, (err) => {
          if (err) throw err;
          puginsDirs.push(_pugins);
          console.log("生成成功");
        });
      });
    });


    const config = configFactory("development");
    const protocol = process.env.HTTPS === "true" ? "https" : "http";
    const appName = require(paths.appPackageJson).name;

    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );
    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn,
      useTypeScript,
      webpack,
    });
    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      paths.publicUrlOrPath
    );
    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = {
      ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
      host: HOST,
      port,
    };
    const config1 = {
      ...serverConfig,
      // resolve: {
      //   alias: {
      //     '@root': rootDir,
      //   },
      // },
    }
    const devServer = new WebpackDevServer(config1, compiler);
    // Launch WebpackDevServer.
    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole();
      }

      if (env.raw.FAST_REFRESH && semver.lt(react.version, "16.10.0")) {
        console.log(
          chalk.yellow(
            `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
          )
        );
      }

      console.log(chalk.cyan("Starting the development server...\n"));
      openBrowser(urls.localUrlForBrowser);
    });

    ["SIGINT", "SIGTERM"].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        process.exit();
      });
    });

    if (process.env.CI !== "true") {
      // Gracefully exit when stdin ends
      process.stdin.on("end", function () {
        devServer.close();
        process.exit();
      });
    }
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
