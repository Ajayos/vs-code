"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDroplet = exports.createDroplet = void 0;
const got_1 = __importDefault(require("got"));
const DIGITALOCEAN_API_URL = "https://api.digitalocean.com/v2";
const createDroplet = async ({ token, userData, }) => {
    return got_1.default
        .post(`${DIGITALOCEAN_API_URL}/droplets`, {
        json: {
            name: "code-server",
            region: "nyc3",
            size: "s-1vcpu-1gb",
            image: "ubuntu-20-10-x64",
            user_data: userData,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .json()
        .then((data) => data.droplet);
};
exports.createDroplet = createDroplet;
const getDroplet = async ({ token, id }) => {
    return got_1.default(`${DIGITALOCEAN_API_URL}/droplets/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .json()
        .then((data) => data.droplet);
};
exports.getDroplet = getDroplet;
//# sourceMappingURL=digitalOcean.js.map