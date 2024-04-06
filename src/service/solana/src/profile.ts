import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import * as pda from "./addresses";
import { AnchorSola } from "./anchor_sola";
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  MintProfileParams,
  RegisterParams,
  SetClassGenericParams,
  SetGroupControllerParams,
  SetTokenClassStateParams,
} from "./common";
import { Mint } from "./registry";

export class ProfileProgram {
  program: anchor.Program<AnchorSola>;

  constructor(program: anchor.Program<AnchorSola>) {
    this.program = program;
  }

  async burnProfile(
    profileId: anchor.BN,
    owner: web3.PublicKey,
    close?: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const profileMint = pda.mintProfile(profileId)[0];
    const solaProfile = pda.solaProfile(profileMint)[0];
    const mint = new Mint(profileMint, owner);
    return this.program.methods
      .burnProfile(profileId)
      .accounts({
        addressDefaultProfiles: pda.solaDefaultProfiles(owner)[0],
        masterToken: mint.masterToken,
        masterMint: mint.masterMint,
        masterMetadata: mint.masterMetadata,
        masterEdition: mint.masterEdition,
        tokenRecord: mint.tokenRecord,
        solaProfile,
        owner: owner,
        close: close ? close : owner,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([owner] as any)
      .instruction();
  }

  async initializeeProfileGlobal(
    chainid: anchor.BN,
    uri: string,
    payer: web3.Keypair,
    owner?: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    return this.program.methods
      .initializee(chainid, uri)
      .accounts({
        solaProfileGlobal: pda.solaProfileGlobal()[0],
        payer: payer.publicKey,
        owner: owner ? owner : payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .instruction();
  }

  async mintDefaultProfile(
    profileId: anchor.BN,
    params: MintProfileParams,
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    const profileMint = pda.mintProfile(profileId)[0];
    const solaProfile = pda.solaProfile(profileMint)[0];
    const mint = new Mint(profileMint, to);
    return this.program.methods
      .mintProfile(profileId, params)
      .accounts({
        solaCreator: pda.solaCreator(
          publisher ? publisher.publicKey : payer.publicKey
        )[0],
        addressDefaultProfiles: pda.solaDefaultProfiles(to)[0],
        masterToken: mint.masterToken,
        masterMint: mint.masterMint,
        masterMetadata: mint.masterMetadata,
        masterEdition: mint.masterEdition,
        tokenRecord: mint.tokenRecord,
        solaProfile,
        payer: payer.publicKey,
        publisher: publisher ? publisher.publicKey : payer.publicKey,
        to,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(publisher ? [payer, publisher] : [payer])
      .instruction();
  }

  async mintGroupProfile(
    profileId: anchor.BN,
    params: MintProfileParams,
    payer: web3.Keypair,
    to: web3.PublicKey,
    publisher?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    const profileMint = pda.mintProfile(profileId)[0];
    const solaProfile = pda.solaProfile(profileMint)[0];
    const mint = new Mint(profileMint, to);
    return this.program.methods
      .mintProfile(profileId, params)
      .accounts({
        solaCreator: pda.solaCreator(
          publisher ? publisher.publicKey : payer.publicKey
        )[0],
        addressDefaultProfiles: null,
        masterToken: mint.masterToken,
        masterMint: mint.masterMint,
        masterMetadata: mint.masterMetadata,
        masterEdition: mint.masterEdition,
        tokenRecord: mint.tokenRecord,
        solaProfile,
        payer: payer.publicKey,
        publisher: publisher ? publisher.publicKey : payer.publicKey,
        to,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(publisher ? [payer, publisher] : [payer])
      .instruction();
  }

  async register(
    classId: anchor.BN,
    profileId: anchor.BN,
    params: RegisterParams,
    payer: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    return this.program.methods
      .register(classId, profileId, params)
      .accounts({
        tokenClass: pda.tokenClass(classId)[0],
        payer: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .instruction();
  }

  async setClassGeneric(
    classId: anchor.BN,
    params: SetClassGenericParams,
    payer: web3.Keypair,
    authority?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    const tokenClass = pda.tokenClass(classId)[0];
    const controllerId = (
      await this.program.account.tokenClass.fetch(tokenClass)
    ).controller;
    const profileMint = pda.mintProfile(controllerId)[0];
    const mint = new Mint(
      profileMint,
      authority ? authority.publicKey : payer.publicKey
    );
    return this.program.methods
      .setClassGeneric(classId, params)
      .accounts({
        tokenClass,
        masterMint: profileMint,
        masterToken: mint.masterToken,
        dispatcher: pda.dispatcher(profileMint)[0],
        defaultDispatcher: pda.defaultDispatcher()[0],
        groupController: pda.groupController(
          profileMint,
          authority ? authority.publicKey : payer.publicKey
        )[0],
        classGeneric: pda.classGeneric(tokenClass)[0],
        payer: payer.publicKey,
        authority: authority ? authority.publicKey : payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(authority ? [authority, payer] : [payer])
      .instruction();
  }

  async setDefaultDispatcher(
    payer: web3.Keypair,
    dispatcher: web3.PublicKey,
    owner?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    return this.program.methods
      .setDefaultDispatcher()
      .accounts({
        solaProfileGlobal: pda.solaProfileGlobal()[0],
        defaultDispatcher: pda.defaultDispatcher()[0],
        payer: payer.publicKey,
        owner: owner ? owner.publicKey : payer.publicKey,
        dispatcher,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(owner ? [owner, payer] : [payer])
      .instruction();
  }

  async setDispatcher(
    controllerId: anchor.BN,
    payer: web3.Keypair,
    dispatcher: web3.PublicKey,
    owner?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    const profileMint = pda.mintProfile(controllerId)[0];
    const mint = new Mint(
      profileMint,
      owner ? owner.publicKey : payer.publicKey
    );
    return this.program.methods
      .setDispatcher(controllerId)
      .accounts({
        masterMint: profileMint,
        masterToken: mint.masterToken,
        dispatcher: pda.dispatcher(profileMint)[0],
        payer: payer.publicKey,
        owner: owner ? owner.publicKey : payer.publicKey,
        userDispatcher: dispatcher,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(owner ? [payer, owner] : [payer])
      .instruction();
  }

  async setGroupController(
    controllerId: anchor.BN,
    payer: web3.Keypair,
    controller: web3.PublicKey,
    params: SetGroupControllerParams,
    authority?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    const profileMint = pda.mintProfile(controllerId)[0];
    const mint = new Mint(
      profileMint,
      authority ? authority.publicKey : payer.publicKey
    );
    return this.program.methods
      .setGroupController(controllerId, params)
      .accounts({
        masterMint: profileMint,
        masterToken: mint.masterToken,
        dispatcher: pda.dispatcher(profileMint)[0],
        defaultDispatcher: pda.defaultDispatcher()[0],
        groupController: pda.groupController(profileMint, controller)[0],
        payer: payer.publicKey,
        authority: authority ? authority.publicKey : payer.publicKey,
        controller,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(authority ? [authority, payer] : [payer])
      .instruction();
  }

  async setProfileCreator(
    status: boolean,
    payer: web3.Keypair,
    creator: web3.PublicKey,
    owner?: web3.Keypair
  ): Promise<web3.TransactionInstruction> {
    return this.program.methods
      .setProfileCreator(status)
      .accounts({
        solaProfileGlobal: pda.solaProfileGlobal()[0],
        solaCreator: pda.solaCreator(creator)[0],
        payer: payer.publicKey,
        owner: owner ? owner.publicKey : payer.publicKey,
        creator,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(owner ? [owner, payer] : [payer])
      .instruction();
  }

  async setTokenClassState(
    classId: anchor.BN,
    params: SetTokenClassStateParams,
    payer: web3.Keypair,
    controller: web3.PublicKey,
    authority?: web3.Keypair,
    profileId?: anchor.BN
  ): Promise<web3.TransactionInstruction> {
    const tokenClass = pda.tokenClass(classId)[0];
    const controllerId = profileId
      ? profileId
      : (await this.program.account.tokenClass.fetch(tokenClass)).controller;
    const profileMint = pda.mintProfile(controllerId)[0];
    const mint = new Mint(
      profileMint,
      authority ? authority.publicKey : payer.publicKey
    );

    return this.program.methods
      .setTokenClassState(classId, params)
      .accounts({
        tokenClass,
        masterMint: profileMint,
        masterToken: mint.masterToken,
        dispatcher: pda.dispatcher(profileMint)[0],
        defaultDispatcher: pda.defaultDispatcher()[0],
        tokenClassState: pda.tokenClassState(tokenClass, controller)[0],
        payer: payer.publicKey,
        authority: authority ? authority.publicKey : payer.publicKey,
        controller,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers(authority ? [authority, payer] : [payer])
      .instruction();
  }

  async updateProfileGlobal(
    chainid: anchor.BN,
    uri: string,
    owner: web3.Keypair,
    newOwner: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    return this.program.methods
      .updateProfileGlobal(chainid, uri)
      .accounts({
        solaProfileGlobal: pda.solaProfileGlobal()[0],
        owner: owner.publicKey,
        newOwner,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([owner])
      .instruction();
  }


  /// 返回默认的profile id
  /// 需要错误处理，如果没有默认的profile id会报错
  /// 网络连接失败也会报错
  async featchDefaultProfileId(owner: web3.PublicKey): Promise<anchor.BN> {
    const profileId = await
      this.program.account
        .defaultProfileId
        .fetch(pda.solaDefaultProfiles(owner)[0]);

    return profileId.profileId;
  }

  async featchAllProfile(owner: web3.PublicKey, commitment?: web3.Commitment): Promise<{
    profileId: anchor.BN;
    mint: web3.PublicKey,
    metadata: web3.PublicKey,
    edition: web3.PublicKey,
    addressDefaultProfiles: web3.PublicKey | null | undefined
  }[]> {
    const allTokens = (await this.program.provider.connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }, commitment ? commitment : "confirmed")).value.map(token => {
      return pda.solaProfile(token.pubkey)[0];
    });

    const profiles = (await this.program.account.solaProfile.fetchMultiple(allTokens)).filter(profile => profile)
      .map(profile => {
        return {
          profileId: new anchor.BN(profile!.profileId, 8, "be"),
          mint: profile!.masterMint,
          metadata: profile!.masterMetadata,
          edition: profile!.masterEdition,
          addressDefaultProfiles: profile!.addressDefaultProfiles ? profile!.addressDefaultProfiles : null
        }
      });

    return profiles;
  }
}
