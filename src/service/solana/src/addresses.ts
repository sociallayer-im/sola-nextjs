import * as web3 from "@solana/web3.js";
import { PROGRAM_ID, MPL_TOKEN_METADATA_PROGRAM_ID } from "./common";
import * as anchor from "@coral-xyz/anchor";

export function mintProfile(profileId: any): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint_profile"), profileId.toArray("be", 8)],
    PROGRAM_ID
  );
}

export function mintBadge(badgeId: any): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint_badge"), badgeId.toArray("be", 8)],
    PROGRAM_ID
  );
}

export function badgeState(
  badgeMint: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("badge_state"), badgeMint.toBytes()],
    PROGRAM_ID
  );
}

export function lineageOrigins(
  badgeMint: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("lineage_origins"), badgeMint.toBytes()],
    PROGRAM_ID
  );
}

export function genericOrigins(
  badgeMint: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("generic_origins"), badgeMint.toBytes()],
    PROGRAM_ID
  );
}

export function tokenClass(classId: any): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token_class"), classId.toArray("be", 8)],
    PROGRAM_ID
  );
}

export function tokenClassState(
  tokenClass: web3.PublicKey,
  controller: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("token_class_state"),
      tokenClass.toBytes(),
      controller.toBytes(),
    ],
    PROGRAM_ID
  );
}

export function groupController(
  profileMint: web3.PublicKey,
  controller: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("group_controller"),
      profileMint.toBytes(),
      controller.toBytes(),
    ],
    PROGRAM_ID
  );
}

export function defaultDispatcher(): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("default_dispatcher")],
    PROGRAM_ID
  );
}

export function dispatcher(
  profileMint: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dispatcher"), profileMint.toBytes()],
    PROGRAM_ID
  );
}

export function badgeGlobal(): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("badge_global")],
    PROGRAM_ID
  );
}

export function solaProfileGlobal(): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sola_profile_global")],
    PROGRAM_ID
  );
}
export function solaCreator(creator: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sola_profile_creator"), creator.toBytes()],
    PROGRAM_ID
  );
}
export function solaDefaultProfiles(
  to: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sola_default_profiles"), to.toBytes()],
    PROGRAM_ID
  );
}

export function IsProfileCreator(
  publisher: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sola_profile_creator"), publisher.toBytes()],
    PROGRAM_ID
  );
}

export function classGeneric(
  tokenClass: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("class_generic"), tokenClass.toBytes()],
    PROGRAM_ID
  );
}

export function getMasterMetadataAddress(
  masterMint: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBytes(),
      masterMint.toBytes(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
}
export function getMasterEditionAddress(
  masterMint: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBytes(),
      masterMint.toBytes(),
      Buffer.from("edition"),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
}
export function getTokenRecordAddress(
  masterMint: web3.PublicKey,
  masterToken: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBytes(),
      masterMint.toBytes(),
      Buffer.from("token_record"),
      masterToken.toBytes(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
}

export function solaProfile(
  profileMint: web3.PublicKey
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sola_profile"), profileMint.toBytes()],
    PROGRAM_ID
  );
}
