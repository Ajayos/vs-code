"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployDigitalOcean = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const got_1 = __importDefault(require("got"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const digitalOcean_1 = require("../lib/digitalOcean");
const async_wait_until_1 = __importDefault(require("async-wait-until"));
const getUserDataScript = async () => got_1.default("https://raw.githubusercontent.com/cdr/deploy-code-server/main/deploy-vm/launch-code-server.sh").text();
const isPermissionError = (error) => {
    return error instanceof got_1.default.HTTPError && error.response.statusCode === 401;
};
const getPublicIp = (droplet) => {
    const network = droplet.networks.v4.find((network) => network.type === "public");
    return network === null || network === void 0 ? void 0 : network.ip_address;
};
const isCodeServerLive = async (droplet) => {
    try {
        const response = await got_1.default(`http://${getPublicIp(droplet)}`, { retry: 0 });
        return response.statusCode === 200;
    }
    catch (_a) {
        return false;
    }
};
const handleErrorLog = (error) => {
    if (isPermissionError(error)) {
        console.log(chalk_1.default.red(chalk_1.default.bold("Invalid token."), "Please, verify your token and try again."));
    }
    else {
        console.log(chalk_1.default.red.bold("Something wrong happened"));
        console.log(chalk_1.default.red("You may have to delete the droplet manually on your Digital Ocean dashboard."));
    }
};
const oneMinute = 1000 * 60;
const fiveMinutes = oneMinute * 5;
const waitUntilBeActive = (droplet, token) => {
    return async_wait_until_1.default(async () => {
        const dropletInfo = await digitalOcean_1.getDroplet({ token, id: droplet.id });
        return dropletInfo.status === "active";
    }, { timeout: fiveMinutes, intervalBetweenAttempts: oneMinute / 2 });
};
const waitUntilHasPublicIp = (droplet, token) => {
    return async_wait_until_1.default(async () => {
        const dropletInfo = await digitalOcean_1.getDroplet({ token, id: droplet.id });
        const ip = getPublicIp(dropletInfo);
        return ip !== undefined;
    }, { timeout: fiveMinutes, intervalBetweenAttempts: oneMinute / 2 });
};
const waitUntilCodeServerIsLive = (droplet, token) => {
    return async_wait_until_1.default(async () => {
        const dropletInfo = await digitalOcean_1.getDroplet({ token, id: droplet.id });
        return isCodeServerLive(dropletInfo);
    }, { timeout: fiveMinutes * 2, intervalBetweenAttempts: oneMinute / 2 });
};
const deployDigitalOcean = async () => {
    let spinner;
    console.log(chalk_1.default.blue("You can create a token on", chalk_1.default.bold("https://cloud.digitalocean.com/account/api/tokens")));
    const { token } = await inquirer_1.default.prompt([
        { name: "token", message: "Your Digital Ocean token:", type: "password" },
    ]);
    try {
        let spinner = ora_1.default("Creating droplet and installing code-server").start();
        let droplet = await digitalOcean_1.createDroplet({
            userData: await getUserDataScript(),
            token,
        });
        spinner.stop();
        console.log(chalk_1.default.green("✅ Droplet created"));
        spinner = ora_1.default("Waiting droplet to be active").start();
        await waitUntilBeActive(droplet, token);
        spinner.stop();
        console.log(chalk_1.default.green("✅ Droplet active"));
        spinner = ora_1.default("Waiting droplet to have a public IP").start();
        await waitUntilHasPublicIp(droplet, token);
        spinner.stop();
        console.log(chalk_1.default.green("✅ Public IP is available"));
        spinner = ora_1.default("Waiting code-server to be live. It can take up to 5 minutes.").start();
        await waitUntilCodeServerIsLive(droplet, token);
        droplet = await digitalOcean_1.getDroplet({ token, id: droplet.id });
        spinner.stop();
        console.log(chalk_1.default.green(`🚀 Your code-server is live. You can access it on`, chalk_1.default.bold(`http://${getPublicIp(droplet)}`)));
    }
    catch (error) {
        spinner.stop();
        handleErrorLog(error);
    }
};
exports.deployDigitalOcean = deployDigitalOcean;
//# sourceMappingURL=deployDigitalOcean.js.map