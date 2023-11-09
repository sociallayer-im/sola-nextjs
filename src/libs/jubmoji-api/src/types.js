"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProofInstance = void 0;
// Creates an instance of a proof class
function createProofInstance(constructor, args) {
    return new constructor(args);
}
exports.createProofInstance = createProofInstance;
