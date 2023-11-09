"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMembershipProofArgsFromJubmoji = exports.getJubmojiFromNonceSignature = void 0;
var babyjubjub_ecdsa_1 = require("babyjubjub-ecdsa");
var nfcCard_1 = require("../nfcCard");
var util_1 = require("../util");
var getJubmojiFromNonceSignature = function (_a) {
    var nonce = _a.nonce, rand = _a.rand, sig = _a.sig, pubKeyIndex = _a.pubKeyIndex;
    var decodedSig = (0, babyjubjub_ecdsa_1.derDecodeSignature)(sig);
    var msgHash = (0, nfcCard_1.recoverCounterMessageHash)(nonce, rand);
    var pubKey = (0, babyjubjub_ecdsa_1.publicKeyFromString)((0, util_1.getCardPubKeyFromIndex)(pubKeyIndex));
    var _b = (0, babyjubjub_ecdsa_1.getPublicInputsFromSignature)(decodedSig, msgHash, pubKey), R = _b.R, T = _b.T, U = _b.U;
    return {
        pubKeyIndex: pubKeyIndex,
        sig: sig,
        msgNonce: nonce,
        msgRand: rand,
        R: R.serialize(),
        T: T.serialize(),
        U: U.serialize(),
    };
};
exports.getJubmojiFromNonceSignature = getJubmojiFromNonceSignature;
var getMembershipProofArgsFromJubmoji = function (_a) {
    var pubKeyIndex = _a.pubKeyIndex, sig = _a.sig, msgNonce = _a.msgNonce, msgRand = _a.msgRand, R = _a.R, T = _a.T, U = _a.U;
    return {
        sig: (0, babyjubjub_ecdsa_1.derDecodeSignature)(sig),
        msgHash: (0, nfcCard_1.recoverCounterMessageHash)(msgNonce, msgRand),
        pubKey: (0, util_1.getCardPubKeyFromIndex)(pubKeyIndex),
        R: babyjubjub_ecdsa_1.EdwardsPoint.deserialize(R),
        T: babyjubjub_ecdsa_1.EdwardsPoint.deserialize(T),
        U: babyjubjub_ecdsa_1.EdwardsPoint.deserialize(U),
    };
};
exports.getMembershipProofArgsFromJubmoji = getMembershipProofArgsFromJubmoji;
