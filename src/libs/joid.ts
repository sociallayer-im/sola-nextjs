/* eslint-disable class-methods-use-this */
import { WalletClient } from 'wagmi'
import { Connector } from 'wagmi/connectors'
import {
  UserRejectedRequestError,
  custom,
  createWalletClient,
  Chain,
} from 'viem'
import { EthereumProvider, EvmConfig } from '@joyid/ethereum-provider'

interface JoyIdConnectorOptions {
  chains: Chain[]
  options: EvmConfig
}

export type { EvmConfig } from '@joyid/ethereum-provider'

export { EthereumProvider } from '@joyid/ethereum-provider'

export class JoyIdConnector extends Connector<EthereumProvider, EvmConfig> {
  public id: string = 'joyid'

  public name: string = 'JoyID'

  public ready: boolean = true

  private provider: EthereumProvider

  constructor({ chains, options }: JoyIdConnectorOptions) {
    super({ chains, options })
    this.provider = new EthereumProvider(chains, options)
  }

  public async connect(options?: { chainId?: number }) {
    const account = this.provider.getAccount()
    let chainId = this.provider.getChainId()
    if (account) {
      if (options?.chainId) {
        this.provider.switchChain(chainId)
        chainId = options.chainId
      }
      return {
        account,
        chain: {
          id: chainId,
          unsupported: false,
        },
      }
    }
    try {
      this?.emit('message' as any, { type: 'connecting' })
      const address = await this.provider.connect()
      return {
        account: address,
        chain: {
          id: chainId,
          unsupported: false,
        },
      }
    } catch (error) {
      if (error instanceof Error && error?.message.includes('User rejected')) {
        throw new UserRejectedRequestError(error)
      }
      throw error
    }
  }

  async getWalletClient(): Promise<WalletClient> {
    const chainId = this.provider.getChainId()
    const chain = this.chains.find((x) => x.id === chainId)
    const account = await this.getAccount()
    if (chain == null) {
      throw new Error(`Unsupported chain id: ${chainId}`)
    }
    if (account == null) {
      throw new Error(`No connected account`)
    }
    return createWalletClient({
      account: account!,
      chain,
      transport: custom(this.provider),
    })
  }

  public disconnect(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.provider.disconnect()
      resolve()
    })
  }

  public isAuthorized(): Promise<boolean> {
    return Promise.resolve(this.provider.getAccount() !== null)
  }

  public getAccount() {
    const address = this.provider.getAccount()
    if (address == null) {
      throw new Error('No connected account')
    }
    return Promise.resolve(address)
  }

  public switchChain(chainId: number): Promise<Chain> {
    const chain = this.provider.switchChain(chainId)
    this.emit('change' as any, { chain: { id: chainId, unsupported: false } })
    return Promise.resolve(chain)
  }

  public getChainId() {
    return Promise.resolve(this.provider.getChainId())
  }

  public getProvider(_config?: {
    chainId?: number
  }): Promise<EthereumProvider> {
    return Promise.resolve(this.provider)
  }

  protected onDisconnect() {
    this?.emit('disconnect' as any)
  }

  protected onChainChanged(chainId: number) {
    this.emit('change' as any, { chain: { id: chainId, unsupported: true } })
  }

  protected onAccountsChanged(_accounts: `0x${string}`[]): void {
    //
  }
}
