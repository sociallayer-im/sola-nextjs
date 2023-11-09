"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamLeaderboard = exports.PublicMessageSignature = exports.NUniqueJubmojisInCollection = exports.JubmojiInCollectionWithNonce = exports.JubmojiInCollection = void 0;
// All definition of proving and verification classes
var babyjubjub_ecdsa_1 = require("babyjubjub-ecdsa");
var merkleCache_1 = require("./merkleCache");
var nfcCard_1 = require("./nfcCard");
var util_1 = require("./util");
var secp256k1_1 = require("@noble/secp256k1");
var data_1 = require("./data");
var JubmojiInCollection = /** @class */ (function () {
    function JubmojiInCollection(_a) {
        var collectionPubKeys = _a.collectionPubKeys, sigNullifierRandomness = _a.sigNullifierRandomness, pathToCircuits = _a.pathToCircuits, onUpdateProvingState = _a.onUpdateProvingState;
        this.collectionPubKeys = collectionPubKeys;
        this.sigNullifierRandomness = sigNullifierRandomness;
        this.pathToCircuits = pathToCircuits;
        this.onUpdateProvingState = onUpdateProvingState;
    }
    JubmojiInCollection.prototype.prove = function (_a) {
        var _b, _c;
        var jubmoji = _a.jubmoji;
        return __awaiter(this, void 0, void 0, function () {
            var _d, sig, msgHash, pubKey, R, T, U, index, merkleProof, pubKeyNullifierRandomness, membershipProof;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _d = (0, util_1.getMembershipProofArgsFromJubmoji)(jubmoji), sig = _d.sig, msgHash = _d.msgHash, pubKey = _d.pubKey, R = _d.R, T = _d.T, U = _d.U;
                        index = this.collectionPubKeys.indexOf(pubKey);
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleProofFromCache)(this.collectionPubKeys, index)];
                    case 1:
                        merkleProof = _e.sent();
                        pubKeyNullifierRandomness = (0, babyjubjub_ecdsa_1.hexToBigInt)((0, util_1.getRandomNullifierRandomness)());
                        (_b = this.onUpdateProvingState) === null || _b === void 0 ? void 0 : _b.call(this, {
                            numProofsTotal: 1,
                            numProofsCompleted: 0,
                        });
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.proveMembership)({
                                sig: sig,
                                msgHash: msgHash,
                                publicInputs: {
                                    R: R,
                                    T: T,
                                    U: U,
                                },
                                merkleProof: merkleProof,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                pubKeyNullifierRandomness: pubKeyNullifierRandomness,
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 2:
                        membershipProof = _e.sent();
                        (_c = this.onUpdateProvingState) === null || _c === void 0 ? void 0 : _c.call(this, {
                            numProofsTotal: 1,
                            numProofsCompleted: 1,
                        });
                        return [2 /*return*/, {
                                serializedMembershipProof: (0, babyjubjub_ecdsa_1.serializeMembershipProof)(membershipProof),
                            }];
                }
            });
        });
    };
    JubmojiInCollection.prototype.verify = function (_a) {
        var serializedMembershipProof = _a.serializedMembershipProof, usedSigNullifiers = _a.usedSigNullifiers;
        return __awaiter(this, void 0, void 0, function () {
            var merkleRoot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, merkleCache_1.getMerkleRootFromCache)(this.collectionPubKeys)];
                    case 1:
                        merkleRoot = _b.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.verifyMembership)({
                                proof: (0, babyjubjub_ecdsa_1.deserializeMembershipProof)(serializedMembershipProof),
                                merkleRoot: merkleRoot,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                usedSigNullifiers: usedSigNullifiers === null || usedSigNullifiers === void 0 ? void 0 : usedSigNullifiers.map(babyjubjub_ecdsa_1.hexToBigInt),
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return JubmojiInCollection;
}());
exports.JubmojiInCollection = JubmojiInCollection;
// We must also pass the message nonce and random string along with the proof
var JubmojiInCollectionWithNonce = /** @class */ (function () {
    function JubmojiInCollectionWithNonce(_a) {
        var collectionPubKeys = _a.collectionPubKeys, sigNullifierRandomness = _a.sigNullifierRandomness, pathToCircuits = _a.pathToCircuits, onUpdateProvingState = _a.onUpdateProvingState;
        this.collectionPubKeys = collectionPubKeys;
        this.sigNullifierRandomness = sigNullifierRandomness;
        this.pathToCircuits = pathToCircuits;
        this.onUpdateProvingState = onUpdateProvingState;
    }
    JubmojiInCollectionWithNonce.prototype.prove = function (_a) {
        var _b, _c;
        var jubmoji = _a.jubmoji;
        return __awaiter(this, void 0, void 0, function () {
            var _d, sig, msgHash, pubKey, R, T, U, index, merkleProof, pubKeyNullifierRandomness, membershipProof;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _d = (0, util_1.getMembershipProofArgsFromJubmoji)(jubmoji), sig = _d.sig, msgHash = _d.msgHash, pubKey = _d.pubKey, R = _d.R, T = _d.T, U = _d.U;
                        index = this.collectionPubKeys.indexOf(pubKey);
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleProofFromCache)(this.collectionPubKeys, index)];
                    case 1:
                        merkleProof = _e.sent();
                        pubKeyNullifierRandomness = (0, babyjubjub_ecdsa_1.hexToBigInt)((0, util_1.getRandomNullifierRandomness)());
                        (_b = this.onUpdateProvingState) === null || _b === void 0 ? void 0 : _b.call(this, {
                            numProofsTotal: 1,
                            numProofsCompleted: 0,
                        });
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.proveMembership)({
                                sig: sig,
                                msgHash: msgHash,
                                publicInputs: {
                                    R: R,
                                    T: T,
                                    U: U,
                                },
                                merkleProof: merkleProof,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                pubKeyNullifierRandomness: pubKeyNullifierRandomness,
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 2:
                        membershipProof = _e.sent();
                        (_c = this.onUpdateProvingState) === null || _c === void 0 ? void 0 : _c.call(this, {
                            numProofsTotal: 1,
                            numProofsCompleted: 1,
                        });
                        return [2 /*return*/, {
                                serializedMembershipProof: (0, babyjubjub_ecdsa_1.serializeMembershipProof)(membershipProof),
                                msgNonce: jubmoji.msgNonce,
                                msgRand: jubmoji.msgRand,
                            }];
                }
            });
        });
    };
    JubmojiInCollectionWithNonce.prototype.verify = function (_a) {
        var serializedMembershipProof = _a.serializedMembershipProof, msgNonce = _a.msgNonce, msgRand = _a.msgRand, usedSigNullifiers = _a.usedSigNullifiers;
        return __awaiter(this, void 0, void 0, function () {
            var membershipProof, msgHash, merkleRoot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        membershipProof = (0, babyjubjub_ecdsa_1.deserializeMembershipProof)(serializedMembershipProof);
                        msgHash = (0, nfcCard_1.recoverCounterMessageHash)(msgNonce, msgRand);
                        if (msgHash !== membershipProof.msgHash) {
                            return [2 /*return*/, { verified: false }];
                        }
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleRootFromCache)(this.collectionPubKeys)];
                    case 1:
                        merkleRoot = _b.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.verifyMembership)({
                                proof: membershipProof,
                                merkleRoot: merkleRoot,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                usedSigNullifiers: usedSigNullifiers === null || usedSigNullifiers === void 0 ? void 0 : usedSigNullifiers.map(babyjubjub_ecdsa_1.hexToBigInt),
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return JubmojiInCollectionWithNonce;
}());
exports.JubmojiInCollectionWithNonce = JubmojiInCollectionWithNonce;
var NUniqueJubmojisInCollection = /** @class */ (function () {
    function NUniqueJubmojisInCollection(_a) {
        var collectionPubKeys = _a.collectionPubKeys, sigNullifierRandomness = _a.sigNullifierRandomness, N = _a.N, pathToCircuits = _a.pathToCircuits, onUpdateProvingState = _a.onUpdateProvingState;
        this.collectionPubKeys = collectionPubKeys;
        this.sigNullifierRandomness = sigNullifierRandomness;
        this.N = N;
        this.pathToCircuits = pathToCircuits;
        this.onUpdateProvingState = onUpdateProvingState;
    }
    NUniqueJubmojisInCollection.prototype.prove = function (_a) {
        var _b, _c;
        var jubmojis = _a.jubmojis;
        return __awaiter(this, void 0, void 0, function () {
            var pubKeyNullifierRandomness, numProofsTotal, membershipProofs, i, jubmoji, _d, sig, msgHash, pubKey, R, T, U, merkleProof, membershipProof;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pubKeyNullifierRandomness = (0, babyjubjub_ecdsa_1.hexToBigInt)((0, util_1.getRandomNullifierRandomness)());
                        numProofsTotal = jubmojis.length;
                        (_b = this.onUpdateProvingState) === null || _b === void 0 ? void 0 : _b.call(this, {
                            numProofsTotal: numProofsTotal,
                            numProofsCompleted: 0,
                        });
                        membershipProofs = [];
                        i = 0;
                        _e.label = 1;
                    case 1:
                        if (!(i < jubmojis.length)) return [3 /*break*/, 5];
                        jubmoji = jubmojis[i];
                        _d = (0, util_1.getMembershipProofArgsFromJubmoji)(jubmoji), sig = _d.sig, msgHash = _d.msgHash, pubKey = _d.pubKey, R = _d.R, T = _d.T, U = _d.U;
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleProofFromCache)(this.collectionPubKeys, this.collectionPubKeys.indexOf(pubKey))];
                    case 2:
                        merkleProof = _e.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.proveMembership)({
                                sig: sig,
                                msgHash: msgHash,
                                publicInputs: {
                                    R: R,
                                    T: T,
                                    U: U,
                                },
                                merkleProof: merkleProof,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                pubKeyNullifierRandomness: pubKeyNullifierRandomness,
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 3:
                        membershipProof = _e.sent();
                        membershipProofs.push(membershipProof);
                        (_c = this.onUpdateProvingState) === null || _c === void 0 ? void 0 : _c.call(this, {
                            numProofsTotal: numProofsTotal,
                            numProofsCompleted: i + 1,
                        });
                        _e.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, {
                            serializedMembershipProofs: membershipProofs.map(babyjubjub_ecdsa_1.serializeMembershipProof),
                        }];
                }
            });
        });
    };
    // Checks that all the membershipProofs are valid, and that their pubKeyNullifiers are unique
    // while having the same pubKeyNullifierRandomnessHash
    NUniqueJubmojisInCollection.prototype.verify = function (_a) {
        var serializedMembershipProofs = _a.serializedMembershipProofs, usedSigNullifiers = _a.usedSigNullifiers;
        return __awaiter(this, void 0, void 0, function () {
            var membershipProofs, pubKeyNullifiers, pubKeyNullifierRandomnessHashes, merkleRoot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Must have at least N proofs
                        if (serializedMembershipProofs.length < this.N) {
                            return [2 /*return*/, { verified: false }];
                        }
                        membershipProofs = serializedMembershipProofs.map(babyjubjub_ecdsa_1.deserializeMembershipProof);
                        pubKeyNullifiers = membershipProofs.map(function (proof) { return (0, babyjubjub_ecdsa_1.getPublicSignalsFromMembershipZKP)(proof.zkp).pubKeyNullifier; });
                        if (!(0, babyjubjub_ecdsa_1.areAllBigIntsDifferent)(pubKeyNullifiers)) {
                            return [2 /*return*/, { verified: false }];
                        }
                        pubKeyNullifierRandomnessHashes = membershipProofs.map(function (proof) {
                            return (0, babyjubjub_ecdsa_1.getPublicSignalsFromMembershipZKP)(proof.zkp)
                                .pubKeyNullifierRandomnessHash;
                        });
                        if (!(0, babyjubjub_ecdsa_1.areAllBigIntsTheSame)(pubKeyNullifierRandomnessHashes)) {
                            return [2 /*return*/, { verified: false }];
                        }
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleRootFromCache)(this.collectionPubKeys)];
                    case 1:
                        merkleRoot = _b.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.batchVerifyMembership)({
                                proofs: membershipProofs,
                                merkleRoot: merkleRoot,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                usedSigNullifiers: usedSigNullifiers === null || usedSigNullifiers === void 0 ? void 0 : usedSigNullifiers.map(babyjubjub_ecdsa_1.hexToBigInt),
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return NUniqueJubmojisInCollection;
}());
exports.NUniqueJubmojisInCollection = NUniqueJubmojisInCollection;
var PublicMessageSignature = /** @class */ (function () {
    function PublicMessageSignature(classArgs) {
        this.randStr = classArgs.randStr;
    }
    PublicMessageSignature.prototype.prove = function (proofArgs) {
        return Promise.resolve(proofArgs);
    };
    PublicMessageSignature.prototype.verify = function (_a) {
        var message = _a.message, rawSig = _a.rawSig, pubKeyIndex = _a.pubKeyIndex;
        // If there is a randStr, prepend it to the message
        var fullMessage = this.randStr ? this.randStr + message : message;
        var msgHash = (0, util_1.getMessageHash)(fullMessage);
        var r = rawSig.r, s = rawSig.s, v = rawSig.v;
        var signature = new secp256k1_1.Signature((0, babyjubjub_ecdsa_1.hexToBigInt)(r), (0, babyjubjub_ecdsa_1.hexToBigInt)(s), v - 27 // The NFC card uses v = 27 or 28, but the secp library wants recovery to be 0 or 1
        );
        var claimedPublicKey = data_1.cardPubKeys[pubKeyIndex].pubKeySlot1; // Use secp256k1 key from slot 1
        var recoveredPublicKey;
        try {
            recoveredPublicKey = signature
                .recoverPublicKey((0, babyjubjub_ecdsa_1.bigIntToBytes)(msgHash))
                .toHex(false); // Get the uncompressed public key
        }
        catch (_b) {
            return Promise.resolve({ verified: false });
        }
        return Promise.resolve({
            verified: claimedPublicKey === recoveredPublicKey,
        });
    };
    return PublicMessageSignature;
}());
exports.PublicMessageSignature = PublicMessageSignature;
var TeamLeaderboard = /** @class */ (function () {
    function TeamLeaderboard(_a) {
        var teamPubKeys = _a.teamPubKeys, collectionPubKeys = _a.collectionPubKeys, sigNullifierRandomness = _a.sigNullifierRandomness, pathToCircuits = _a.pathToCircuits, onUpdateProvingState = _a.onUpdateProvingState;
        this.teamPubKeys = teamPubKeys;
        this.collectionPubKeys = collectionPubKeys;
        this.sigNullifierRandomness = sigNullifierRandomness;
        this.pathToCircuits = pathToCircuits;
        this.onUpdateProvingState = onUpdateProvingState;
    }
    TeamLeaderboard.prototype.prove = function (_a) {
        var _b, _c, _d;
        var teamJubmoji = _a.teamJubmoji, collectionJubmojis = _a.collectionJubmojis;
        return __awaiter(this, void 0, void 0, function () {
            var pubKeyNullifierRandomness, numProofsTotal, _e, sig, msgHash, pubKey, R, T, U, teamMerkleProof, teamMembershipProof, collectionMembershipProofs, i, jubmoji, _f, sig_1, msgHash_1, pubKey_1, R_1, T_1, U_1, collectionMerkleProof, collectionMembershipProof;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        pubKeyNullifierRandomness = (0, babyjubjub_ecdsa_1.hexToBigInt)((0, util_1.getRandomNullifierRandomness)());
                        numProofsTotal = collectionJubmojis.length + 1;
                        (_b = this.onUpdateProvingState) === null || _b === void 0 ? void 0 : _b.call(this, {
                            numProofsTotal: numProofsTotal,
                            numProofsCompleted: 0,
                        });
                        _e = (0, util_1.getMembershipProofArgsFromJubmoji)(teamJubmoji), sig = _e.sig, msgHash = _e.msgHash, pubKey = _e.pubKey, R = _e.R, T = _e.T, U = _e.U;
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleProofFromCache)([pubKey], 0)];
                    case 1:
                        teamMerkleProof = _g.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.proveMembership)({
                                sig: sig,
                                msgHash: msgHash,
                                publicInputs: {
                                    R: R,
                                    T: T,
                                    U: U,
                                },
                                merkleProof: teamMerkleProof,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                pubKeyNullifierRandomness: pubKeyNullifierRandomness,
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 2:
                        teamMembershipProof = _g.sent();
                        (_c = this.onUpdateProvingState) === null || _c === void 0 ? void 0 : _c.call(this, {
                            numProofsTotal: numProofsTotal,
                            numProofsCompleted: 1,
                        });
                        collectionMembershipProofs = [];
                        i = 0;
                        _g.label = 3;
                    case 3:
                        if (!(i < collectionJubmojis.length)) return [3 /*break*/, 7];
                        jubmoji = collectionJubmojis[i];
                        _f = (0, util_1.getMembershipProofArgsFromJubmoji)(jubmoji), sig_1 = _f.sig, msgHash_1 = _f.msgHash, pubKey_1 = _f.pubKey, R_1 = _f.R, T_1 = _f.T, U_1 = _f.U;
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleProofFromCache)(this.collectionPubKeys, this.collectionPubKeys.indexOf(pubKey_1))];
                    case 4:
                        collectionMerkleProof = _g.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.proveMembership)({
                                sig: sig_1,
                                msgHash: msgHash_1,
                                publicInputs: {
                                    R: R_1,
                                    T: T_1,
                                    U: U_1,
                                },
                                merkleProof: collectionMerkleProof,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                pubKeyNullifierRandomness: pubKeyNullifierRandomness,
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 5:
                        collectionMembershipProof = _g.sent();
                        collectionMembershipProofs.push(collectionMembershipProof);
                        (_d = this.onUpdateProvingState) === null || _d === void 0 ? void 0 : _d.call(this, {
                            numProofsTotal: numProofsTotal,
                            numProofsCompleted: i + 2, // Include this proof and the team proof
                        });
                        _g.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, {
                            teamPubKeyIndex: teamJubmoji.pubKeyIndex,
                            serializedTeamMembershipProof: (0, babyjubjub_ecdsa_1.serializeMembershipProof)(teamMembershipProof),
                            serializedCollectionMembershipProofs: collectionMembershipProofs.map(babyjubjub_ecdsa_1.serializeMembershipProof),
                        }];
                }
            });
        });
    };
    TeamLeaderboard.prototype.verify = function (_a) {
        var teamPubKeyIndex = _a.teamPubKeyIndex, serializedTeamMembershipProof = _a.serializedTeamMembershipProof, serializedCollectionMembershipProofs = _a.serializedCollectionMembershipProofs;
        return __awaiter(this, void 0, void 0, function () {
            var teamPubKey, teamMerkleRoot, teamVerificationResult, collectionMembershipProofs, collectionMerkleRoot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        teamPubKey = (0, util_1.getCardPubKeyFromIndex)(teamPubKeyIndex);
                        if (!this.teamPubKeys.includes(teamPubKey)) {
                            return [2 /*return*/, { verified: false }];
                        }
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleRootFromCache)([teamPubKey])];
                    case 1:
                        teamMerkleRoot = _b.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.verifyMembership)({
                                proof: (0, babyjubjub_ecdsa_1.deserializeMembershipProof)(serializedTeamMembershipProof),
                                merkleRoot: teamMerkleRoot,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                usedSigNullifiers: undefined,
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 2:
                        teamVerificationResult = _b.sent();
                        if (!teamVerificationResult.verified) {
                            return [2 /*return*/, { verified: false }]; // User is not in the team they claim to be in
                        }
                        collectionMembershipProofs = serializedCollectionMembershipProofs.map(babyjubjub_ecdsa_1.deserializeMembershipProof);
                        return [4 /*yield*/, (0, merkleCache_1.getMerkleRootFromCache)(this.collectionPubKeys)];
                    case 3:
                        collectionMerkleRoot = _b.sent();
                        return [4 /*yield*/, (0, babyjubjub_ecdsa_1.batchVerifyMembership)({
                                proofs: collectionMembershipProofs,
                                merkleRoot: collectionMerkleRoot,
                                sigNullifierRandomness: (0, babyjubjub_ecdsa_1.hexToBigInt)(this.sigNullifierRandomness),
                                usedSigNullifiers: undefined,
                                pathToCircuits: this.pathToCircuits,
                            })];
                    case 4: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return TeamLeaderboard;
}());
exports.TeamLeaderboard = TeamLeaderboard;
