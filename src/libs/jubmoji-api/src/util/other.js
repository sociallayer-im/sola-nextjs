"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendHexString = exports.getRandomNullifierRandomness = void 0;
var babyjubjub_ecdsa_1 = require("babyjubjub-ecdsa");
var crypto = require("crypto");
// Generates randomness for nullifiers
// Uses Crypto Web API in browser and Node.js Crypto module in Node.js
var getRandomNullifierRandomness = function () {
    var numBytes = 30; // Generate a number of bytes smaller than the size of a field element
    if ((0, babyjubjub_ecdsa_1.isNode)()) {
        return crypto.randomBytes(numBytes).toString("hex");
    }
    else {
        return (0, babyjubjub_ecdsa_1.bytesToHex)(self.crypto.getRandomValues(new Uint8Array(numBytes)));
    }
};
exports.getRandomNullifierRandomness = getRandomNullifierRandomness;
// Adjusts a hex string to be a certain length by adding a leading 0 if necessary
var extendHexString = function (hex, desiredLength) {
    var zeros = "0".repeat(desiredLength - hex.length);
    return zeros + hex;
};
exports.extendHexString = extendHexString;
