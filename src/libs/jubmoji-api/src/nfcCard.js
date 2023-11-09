"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverCounterMessageHash = exports.recoverArbitraryMessageHash = exports.getECDSAMessageHash = exports.getMessageHash = exports.HASH_DIGEST_LENGTH = void 0;
// All functions related to handling Arx NFC cards
var js_sha256_1 = require("js-sha256");
var util_1 = require("./util");
var babyjubjub_ecdsa_1 = require("babyjubjub-ecdsa");
exports.HASH_DIGEST_LENGTH = 256;
// Hashes a message using SHA256 and returns the hash as a bigint
var getMessageHash = function (msg) {
    var hasher = js_sha256_1.sha256.create();
    var hash = hasher.update(msg).hex();
    return (0, babyjubjub_ecdsa_1.hexToBigInt)(hash);
};
exports.getMessageHash = getMessageHash;
// Prepares a message for ECDSA signing by hashing it and truncating the hash
var getECDSAMessageHash = function (msg) {
    var hasher = js_sha256_1.sha256.create();
    var hash = hasher.update(msg).hex();
    // As part of the ECDSA algorithm, we truncate the hash to its left n bits,
    // where n is the bit length of the order of the curve.
    // Truncation includes any leading zeros, so we first pad the hash to the full digest length
    var hashBits = (0, babyjubjub_ecdsa_1.hexToBigInt)(hash)
        .toString(2)
        .padStart(exports.HASH_DIGEST_LENGTH, "0");
    var truncatedBits = hashBits.slice(0, babyjubjub_ecdsa_1.babyjubjub.scalarFieldBitLength);
    return BigInt("0b" + truncatedBits);
};
exports.getECDSAMessageHash = getECDSAMessageHash;
// Recovers the digest of the hash of an arbitrary message
// https://github.com/arx-research/libhalo/blob/master/docs/halo-command-set.md#command-sign
var recoverArbitraryMessageHash = function (msg) {
    return (0, exports.getECDSAMessageHash)(Buffer.from(msg, "utf8"));
};
exports.recoverArbitraryMessageHash = recoverArbitraryMessageHash;
// Recovers the message hash of a counter signature
// https://github.com/arx-research/libhalo/blob/master/docs/halo-command-set.md#command-sign_random
var recoverCounterMessageHash = function (msgNonce, msgRand) {
    // Nonce occupies the first 4 bytes of the message
    var nonceString = (0, util_1.extendHexString)(msgNonce.toString(16), 8);
    // Randomness occupies the next 28 bytes of the message
    var randString = (0, util_1.extendHexString)(msgRand, 56);
    var msgString = nonceString + randString;
    return (0, exports.getECDSAMessageHash)(Buffer.concat([
        Buffer.from("\x19Attest counter pk62:\n", "utf8"),
        Buffer.from(msgString, "hex"),
    ]));
};
exports.recoverCounterMessageHash = recoverCounterMessageHash;
