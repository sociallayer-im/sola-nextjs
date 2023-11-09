"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardPubKeyFromIndex = void 0;
var data_1 = require("../data");
var getCardPubKeyFromIndex = function (index) {
    return data_1.cardPubKeys[index].pubKeyJub;
};
exports.getCardPubKeyFromIndex = getCardPubKeyFromIndex;
