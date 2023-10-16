import fetch from '../utils/fetch'
import {setAuth} from '@/utils/authStorage'

const api = process.env.NEXT_PUBLIC_SOLAS_API

export async function createSiweMessage (address: string, statement: string) {
  const domain = window.location.host
  const origin = window.location.origin
  const res = await fetch.get({ url: `${api}/siwe/nonce` })
  const nonce: any = res.data.nonce;
  (window as any).nonce = nonce
  return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`
}

export async function signInWithEthereum (signer: any): Promise<string> {
  const connect = await signer.requestAddresses()
  const loginAddress = await signer.account.address
  const message = await createSiweMessage(
      loginAddress,
      'Sign in with Ethereum to the app.'
  )
  const signature = await signer.signMessage({account: loginAddress, message})

  const res = await fetch.post({ url: `${api}/siwe/verify`, data: { message, signature, nonce: (window as any).nonce }
  })

  if (res.data.auth_token) {
      setAuth(loginAddress, res.data.auth_token)
  }

  return res.data.auth_token
}
