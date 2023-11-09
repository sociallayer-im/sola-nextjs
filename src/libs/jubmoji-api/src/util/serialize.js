"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.succinctDeserializeJubmojiList = exports.succinctSerializeJubmojiList = exports.deserializeJubmojiList = exports.serializeJubmojiList = exports.deserializeJubmoji = exports.serializeJumboji = void 0;
var data_1 = require("../data");
var proving_1 = require("./proving");
var serializeJumboji = function (jubmoji) {
    return JSON.stringify(jubmoji);
};
exports.serializeJumboji = serializeJumboji;
var deserializeJubmoji = function (seralized) {
    return JSON.parse(seralized);
};
exports.deserializeJubmoji = deserializeJubmoji;
var serializeJubmojiList = function (jubmojis) {
    return JSON.stringify(jubmojis);
};
exports.serializeJubmojiList = serializeJubmojiList;
var deserializeJubmojiList = function (serialized) {
    return JSON.parse(serialized);
};
exports.deserializeJubmojiList = deserializeJubmojiList;
var succinctSerializeJubmojiList = function (jubmojis) {
    var serialization = "";
    for (var _i = 0, jubmojis_1 = jubmojis; _i < jubmojis_1.length; _i++) {
        var jubmoji = jubmojis_1[_i];
        // use base64 encoding to reduce length by 33%
        var base64Serial = [
            // include emoji so URL is more human readable
            data_1.cardPubKeys[jubmoji.pubKeyIndex].emoji,
            Buffer.from(jubmoji.sig, "hex").toString("base64"),
            jubmoji.msgNonce,
            Buffer.from(jubmoji.msgRand, "hex").toString("base64"),
            jubmoji.pubKeyIndex,
        ].join("-");
        serialization += base64Serial + ",";
    }
    return serialization.substring(0, serialization.length - 1);
};
exports.succinctSerializeJubmojiList = succinctSerializeJubmojiList;
var succinctDeserializeJubmojiList = function (serialized) {
    var jubmojis = [];
    var serializedJubmojis = serialized.split(",");
    for (var _i = 0, serializedJubmojis_1 = serializedJubmojis; _i < serializedJubmojis_1.length; _i++) {
        var serializedJubmoji = serializedJubmojis_1[_i];
        var _a = serializedJubmoji.split("-"), _emoji = _a[0], sig = _a[1], msgNonce = _a[2], msgRand = _a[3], pubKeyIndex = _a[4];
        var nonceSig = {
            sig: Buffer.from(sig, "base64").toString("hex").toUpperCase(),
            nonce: parseInt(msgNonce),
            rand: Buffer.from(msgRand, "base64").toString("hex").toUpperCase(),
            pubKeyIndex: parseInt(pubKeyIndex),
        };
        jubmojis.push((0, proving_1.getJubmojiFromNonceSignature)(nonceSig));
    }
    return jubmojis;
};
exports.succinctDeserializeJubmojiList = succinctDeserializeJubmojiList;
