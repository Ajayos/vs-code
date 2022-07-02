#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const deployDigitalOcean_1 = require("./deploys/deployDigitalOcean");
const package_json_1 = __importDefault(require("../package.json"));
const main = async () => {
    commander_1.program.version(package_json_1.default.version).description(package_json_1.default.description);
    commander_1.program.parse();
    await deployDigitalOcean_1.deployDigitalOcean();
    process.exit(0);
};
main();
//# sourceMappingURL=index.js.map