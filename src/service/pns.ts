import { request, gql } from 'graphql-request'
import {NftDetail} from "@/service/alchemy/alchemy";

export async function queryDomainByWalletAddress (address: string) {
    const query = gql`
        query MyQuery {
            domains(where: {owner: {id_eq: "${address}"}, parent: {id_eq: "0x3fce7d1364a893e213bc4212792b517ffc88f5b13b86c8ef9c8d390c3a1370ce"}}) {
                owner {
                  id
                }
                labelName
                labelhash
                name
                id
                createdAt
                parent {
                  id
                  labelName
                  labelhash
                  name
                  registrations {
                    expiryDate
                  }
                }
                registrations {
                  expiryDate
                }
            }
        }
    `
    const customGql = 'https://pnsgraph-api.pns.link/graphql'
    const resp: any = await request(customGql, query)

    const all:NftDetail[] = resp.domains.map((item:any) => {
        return {
            id: item.id,
            title: item.name,
            image: 'https://logo.nftscan.com/glmr_logo/0x7d5f0398549c9fdea03bbdde388361827cb376d5.png',
            contract: '0x7d5f0398549c9fdea03bbdde388361827cb376d5',
            standard: 'ERC721',
            chain: 'Moonbeam',
            explorer: 'https://www.pns.link/domain/'
        }
    })

    return all.filter((item: any) => {
        return item.owner !== '0x0000000000000000000000000000000000000000'
    })
}

