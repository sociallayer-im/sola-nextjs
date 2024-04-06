import * as web3 from "@solana/web3.js";
import { AnchorSola } from "./anchor_sola";
import * as anchor from "@coral-xyz/anchor";
import * as pda from "./addresses";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export class IRegistry {
  tokenClass: web3.PublicKey;
  profileMint: web3.PublicKey;
  dispatcher: web3.PublicKey;
  defaultDispatcher: web3.PublicKey;
  classGeneric: web3.PublicKey;

  constructor(classId: anchor.BN, controllerId: anchor.BN) {
    this.tokenClass = pda.tokenClass(classId)[0];
    this.profileMint = pda.mintProfile(controllerId)[0];
    this.dispatcher = pda.dispatcher(this.profileMint)[0];
    this.defaultDispatcher = pda.defaultDispatcher()[0];
    this.classGeneric = pda.classGeneric(this.tokenClass)[0];
  }
}

export class Mint {
  to: web3.PublicKey;
  masterToken: web3.PublicKey;
  masterMint: web3.PublicKey;
  masterMetadata: web3.PublicKey;
  masterEdition: web3.PublicKey;
  tokenRecord: web3.PublicKey;

  constructor(masterMint: web3.PublicKey, to: web3.PublicKey) {
    this.masterMint = masterMint;
    this.to = to;
    this.masterToken = getAssociatedTokenAddressSync(
      this.masterMint,
      to,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    this.masterEdition = pda.getMasterEditionAddress(this.masterMint)[0];
    this.masterMetadata = pda.getMasterMetadataAddress(this.masterMint)[0];
    this.tokenRecord = pda.getTokenRecordAddress(
      this.masterMint,
      this.masterToken
    )[0];
  }
}
