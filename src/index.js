// External imports
const Koa = require("koa");
const shell = require('shelljs');

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

if (!shell.which("yarn")) {
    shell.echo("Sorry this script requires yarn")
    shell.exit(1)
}

const app = new Koa();

app.use(async ctx => {
    const changeDir = shell.cd("../rainbow-tracker-backends")
    if (changeDir.code === 1) {
        throw new Error(changeDir.stderr)
    }

    const pullChanges = shell.exec("git pull")
    if (pullChanges.code === 1) {
        throw new Error(pullChanges.stderr)
    }

    const removeNodeModules = shell.exec("rm -rf node_modules")
    if (removeNodeModules.code === 1) {
        throw new Error(removeNodeModules.stderr)
    }

    const installPackages = shell.exec("yarn install")
    if (installPackages.code === 1) {
        throw new Error(installPackages.stderr)
    }

    const buildBackend = shell.exec("yarn build")
    if (buildBackend.code === 1) {
        throw new Error(buildBackend.stderr)
    }

    const editBuildIndex = shell.exec("sed -i '1i#!/usr/bin/env node\' dist/index.js")
    if (editBuildIndex.code === 1) {
        throw new Error(editBuildIndex.stderr)
    }

    const restartRainbowService = shell.exec("sudo systemctl restart rainbow-tracker")
    if (restartRainbowService.code === 1) {
        throw new Error(restartRainbowService.stderr)
    }

    ctx.status = 200
});

/**
 * Start server
 */
app.listen(3001, () => {
    console.log("Listening on port 3001");
})
