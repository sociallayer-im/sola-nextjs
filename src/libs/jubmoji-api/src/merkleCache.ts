// Functions related to caching merkle trees
import {
  MerkleProof,
  MAX_MERKLE_TREE_DEPTH,
  publicKeyFromString,
  computeMerkleRoot,
  computeMerkleProof,
} from "babyjubjub-ecdsa";


export const getMerkleRootFromCache = async (
  pubKeyList: string[]
): Promise<bigint> => {
  const pubKeys = pubKeyList.map((pubKey) =>
    publicKeyFromString(pubKey).toEdwards()
  );

  return await computeMerkleRoot(MAX_MERKLE_TREE_DEPTH, pubKeys);
};

export const getMerkleProofFromCache = async (
  pubKeyList: string[],
  leafIndex: number
): Promise<MerkleProof> => {
  const pubKeys = pubKeyList.map((pubKey) =>
    publicKeyFromString(pubKey).toEdwards()
  );

  return await computeMerkleProof(MAX_MERKLE_TREE_DEPTH, pubKeys, leafIndex);
};

export const getMerkleProofListFromCache = async (
  pubKeyList: string[],
  leafIndices: number[]
): Promise<MerkleProof[]> => {
  const pubKeys = pubKeyList.map((pubKey) =>
    publicKeyFromString(pubKey).toEdwards()
  );

  return Promise.all(
    leafIndices.map(
      async (leafIndex) => await computeMerkleProof(MAX_MERKLE_TREE_DEPTH, pubKeys, leafIndex)
    )
  );
};
