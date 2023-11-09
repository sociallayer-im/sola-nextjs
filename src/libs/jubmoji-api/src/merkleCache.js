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
exports.getMerkleProofListFromCache = exports.getMerkleProofFromCache = exports.getMerkleRootFromCache = exports.getMerkleProofFromTree = exports.getMerkleRootFromTree = exports.getMerkleTreeFromCache = void 0;
// Functions related to caching merkle trees
var babyjubjub_ecdsa_1 = require("babyjubjub-ecdsa");
var getMerkleTreeFromCache = function (pubKeyList) {
    // Todo: Either fetch from cache or recompute merkle tree and insert into cache
    throw new Error("Not implemented");
};
exports.getMerkleTreeFromCache = getMerkleTreeFromCache;
var getMerkleRootFromTree = function (tree) {
    return BigInt(tree[-1][0]);
};
exports.getMerkleRootFromTree = getMerkleRootFromTree;
var getMerkleProofFromTree = function (tree, leafIndex) {
    var index = leafIndex;
    var pathIndices = [];
    var siblings = [];
    for (var i = 0; i < babyjubjub_ecdsa_1.MERKLE_TREE_DEPTH; i++) {
        pathIndices.push(index % 2);
        var siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
        var sibling = siblingIndex === tree[i].length
            ? BigInt(babyjubjub_ecdsa_1.MERKLE_TREE_ZEROS[i])
            : (0, babyjubjub_ecdsa_1.hexToBigInt)(tree[i][siblingIndex]);
        siblings.push(sibling);
        index = Math.floor(index / 2);
    }
    return {
        root: (0, exports.getMerkleRootFromTree)(tree),
        pathIndices: pathIndices,
        siblings: siblings,
    };
};
exports.getMerkleProofFromTree = getMerkleProofFromTree;
var getMerkleRootFromCache = function (pubKeyList) { return __awaiter(void 0, void 0, void 0, function () {
    var pubKeys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pubKeys = pubKeyList.map(function (pubKey) {
                    return (0, babyjubjub_ecdsa_1.publicKeyFromString)(pubKey).toEdwards();
                });
                return [4 /*yield*/, (0, babyjubjub_ecdsa_1.computeMerkleRoot)(pubKeys)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getMerkleRootFromCache = getMerkleRootFromCache;
var getMerkleProofFromCache = function (pubKeyList, leafIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var pubKeys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pubKeys = pubKeyList.map(function (pubKey) {
                    return (0, babyjubjub_ecdsa_1.publicKeyFromString)(pubKey).toEdwards();
                });
                return [4 /*yield*/, (0, babyjubjub_ecdsa_1.computeMerkleProof)(pubKeys, leafIndex)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getMerkleProofFromCache = getMerkleProofFromCache;
var getMerkleProofListFromCache = function (pubKeyList, leafIndices) { return __awaiter(void 0, void 0, void 0, function () {
    var pubKeys;
    return __generator(this, function (_a) {
        pubKeys = pubKeyList.map(function (pubKey) {
            return (0, babyjubjub_ecdsa_1.publicKeyFromString)(pubKey).toEdwards();
        });
        return [2 /*return*/, Promise.all(leafIndices.map(function (leafIndex) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, babyjubjub_ecdsa_1.computeMerkleProof)(pubKeys, leafIndex)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            }); }); }))];
    });
}); };
exports.getMerkleProofListFromCache = getMerkleProofListFromCache;
