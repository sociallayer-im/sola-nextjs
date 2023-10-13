import fetch from "../utils/fetch";

export const lensApi = 'https://api.lens.dev/'

export interface LensProfile {
    id: string,
    name: string | null,
    handle: string,
    bio: string | null,
    ownedBy: string,
    isFollowedByMe: boolean,
    stats: {
        totalFollowers: number,
        totalFollowing: number,
        totalPosts: number,
        totalComments: number,
        totalMirrors: number
    },
    attributes: any[],
    picture: {
        original: {
            url: string
        }
    },
    coverPicture: null | string,
    followModule: null | string
    interests: string[],
    isDefault: boolean,
    dispatcher: null | any

}

export interface LensPublication {
    id: string,
    appId: string,
    bookmarked: boolean,
    createdAt: string,
    dataAvailabilityProofs: any,
    hidden: boolean,
    isDataAvailability: boolean,
    isGated: boolean,
    metadata: {
        attributes: any[],
        content: string,
        cover: null | {
            original: {
                url: string,
                mimeType: string,
            }
        },
        image: null | string,
        media: {
            original: {
                url: string,
                mimeType: string,
            }
        }[],
        name: string,
        tags: string[],
    },
    profile: LensProfile,
    mirrorOf: null | LensPublication,
    stats: {
        commentsTotal: number,
        totalAmountOfCollects: number,
        totalAmountOfMirrors: number,
        totalBookmarks: number,
        totalUpvotes: number
    }
}


export async function getLensProfile(walletAddress: string): Promise<null | LensProfile> {
    const res = await fetch.post({
        url: lensApi,
        data: {
            operationName: 'UserProfiles',
            variables: {
                "ownedBy": walletAddress
            },
            ownedBy: walletAddress,
            query: `query UserProfiles($ownedBy: [EthereumAddress!]) {
  profiles(request: {ownedBy: $ownedBy}) {
    items {
      ...ProfileFields
      interests
      isDefault
      dispatcher {
        address
        canUseRelay
        sponsor
        __typename
      }
      __typename
    }
    __typename
  }
}

fragment ProfileFields on Profile {
  id
  name
  handle
  bio
  ownedBy
  isFollowedByMe
  stats {
    totalFollowers
    totalFollowing
    totalPosts
    totalComments
    totalMirrors
    __typename
  }
  attributes {
    traitType
    key
    value
    __typename
  }
  picture {
    ... on MediaSet {
      original {
        url
        __typename
      }
      __typename
    }
    ... on NftImage {
      uri
      tokenId
      contractAddress
      chainId
      __typename
    }
    __typename
  }
  coverPicture {
    ... on MediaSet {
      original {
        url
        __typename
      }
      __typename
    }
    __typename
  }
  followModule {
    __typename
  }
  __typename
}
`
        }
    })

    return (res.data.data.profiles.items && res.data.data.profiles.items.length) ? res.data.data.profiles.items[0] : null
}

export async function getLensPublications(lensId: string): Promise<LensPublication[]> {
    const res = await fetch.post({
        url: lensApi,
        data: {
            operationName: 'ProfileFeed',
            variables: {
                profileId: lensId,
                reactionRequest: {
                    profileId: lensId
                },
                request: {
                    limit: 50,
                    metadata: null,
                    profileId: lensId
                },
                publicationTypes: ["POST", "MIRROR"]
            },
            query: `query ProfileFeed($request: PublicationsQueryRequest!, $reactionRequest: ReactionFieldResolverRequest, $profileId: ProfileId) {
  publications(request: $request) {
    items {
      ... on Post {
        ...PostFields
        __typename
      }
      ... on Comment {
        ...CommentFields
        __typename
      }
      ... on Mirror {
        ...MirrorFields
        __typename
      }
      __typename
    }
    pageInfo {
      next
      __typename
    }
    __typename
  }
}

fragment PostFields on Post {
  id
  profile {
    ...ProfileFields
    __typename
  }
  reaction(request: $reactionRequest)
  mirrors(by: $profileId)
  bookmarked(by: $profileId)
  notInterested(by: $profileId)
  hasCollectedByMe
  onChainContentURI
  isGated
  isDataAvailability
  dataAvailabilityProofs
  canComment(profileId: $profileId) {
    result
    __typename
  }
  canMirror(profileId: $profileId) {
    result
    __typename
  }
  canDecrypt(profileId: $profileId) {
    result
    reasons
    __typename
  }
  collectModule {
    ...CollectModuleFields
    __typename
  }
  stats {
    ...StatsFields
    __typename
  }
  metadata {
    ...MetadataFields
    __typename
  }
  hidden
  createdAt
  appId
  __typename
}

fragment ProfileFields on Profile {
  id
  name
  handle
  bio
  ownedBy
  isFollowedByMe
  stats {
    totalFollowers
    totalFollowing
    totalPosts
    totalComments
    totalMirrors
    __typename
  }
  attributes {
    traitType
    key
    value
    __typename
  }
  picture {
    ... on MediaSet {
      original {
        url
        __typename
      }
      __typename
    }
    ... on NftImage {
      uri
      tokenId
      contractAddress
      chainId
      __typename
    }
    __typename
  }
  coverPicture {
    ... on MediaSet {
      original {
        url
        __typename
      }
      __typename
    }
    __typename
  }
  followModule {
    __typename
  }
  __typename
}

fragment CollectModuleFields on CollectModule {
  ... on FreeCollectModuleSettings {
    type
    contractAddress
    followerOnly
    __typename
  }
  ... on FeeCollectModuleSettings {
    type
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on LimitedFeeCollectModuleSettings {
    type
    collectLimit
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on LimitedTimedFeeCollectModuleSettings {
    type
    collectLimit
    endTimestamp
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on TimedFeeCollectModuleSettings {
    type
    endTimestamp
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on MultirecipientFeeCollectModuleSettings {
    type
    optionalCollectLimit: collectLimit
    optionalEndTimestamp: endTimestamp
    referralFee
    followerOnly
    contractAddress
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    recipients {
      recipient
      split
      __typename
    }
    __typename
  }
  ... on SimpleCollectModuleSettings {
    type
    optionalCollectLimit: collectLimit
    optionalEndTimestamp: endTimestamp
    contractAddress
    followerOnly
    fee {
      amount {
        ...ModuleFeeAmountFields
        __typename
      }
      recipient
      referralFee
      __typename
    }
    __typename
  }
  __typename
}

fragment ModuleFeeAmountFields on ModuleFeeAmount {
  asset {
    symbol
    decimals
    address
    __typename
  }
  value
  __typename
}

fragment StatsFields on PublicationStats {
  totalUpvotes
  totalAmountOfMirrors
  totalAmountOfCollects
  totalBookmarks
  commentsTotal(customFilters: GARDENERS)
  __typename
}

fragment MetadataFields on MetadataOutput {
  name
  content
  image
  tags
  attributes {
    traitType
    value
    __typename
  }
  cover {
    original {
      url
      __typename
    }
    __typename
  }
  media {
    original {
      url
      mimeType
      __typename
    }
    __typename
  }
  encryptionParams {
    accessCondition {
      or {
        criteria {
          ...SimpleConditionFields
          and {
            criteria {
              ...SimpleConditionFields
              __typename
            }
            __typename
          }
          or {
            criteria {
              ...SimpleConditionFields
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}

fragment SimpleConditionFields on AccessConditionOutput {
  nft {
    contractAddress
    chainID
    contractType
    tokenIds
    __typename
  }
  eoa {
    address
    __typename
  }
  token {
    contractAddress
    amount
    chainID
    condition
    decimals
    __typename
  }
  follow {
    profileId
    __typename
  }
  collect {
    publicationId
    thisPublication
    __typename
  }
  __typename
}

fragment CommentFields on Comment {
  id
  profile {
    ...ProfileFields
    __typename
  }
  reaction(request: $reactionRequest)
  mirrors(by: $profileId)
  bookmarked(by: $profileId)
  notInterested(by: $profileId)
  hasCollectedByMe
  onChainContentURI
  isGated
  isDataAvailability
  dataAvailabilityProofs
  canComment(profileId: $profileId) {
    result
    __typename
  }
  canMirror(profileId: $profileId) {
    result
    __typename
  }
  canDecrypt(profileId: $profileId) {
    result
    reasons
    __typename
  }
  collectModule {
    ...CollectModuleFields
    __typename
  }
  stats {
    ...StatsFields
    __typename
  }
  metadata {
    ...MetadataFields
    __typename
  }
  hidden
  createdAt
  appId
  commentOn {
    ... on Post {
      ...PostFields
      __typename
    }
    ... on Comment {
      id
      profile {
        ...ProfileFields
        __typename
      }
      reaction(request: $reactionRequest)
      mirrors(by: $profileId)
      bookmarked(by: $profileId)
      notInterested(by: $profileId)
      hasCollectedByMe
      onChainContentURI
      isGated
      isDataAvailability
      dataAvailabilityProofs
      canComment(profileId: $profileId) {
        result
        __typename
      }
      canMirror(profileId: $profileId) {
        result
        __typename
      }
      canDecrypt(profileId: $profileId) {
        result
        reasons
        __typename
      }
      collectModule {
        ...CollectModuleFields
        __typename
      }
      metadata {
        ...MetadataFields
        __typename
      }
      stats {
        ...StatsFields
        __typename
      }
      mainPost {
        ... on Post {
          ...PostFields
          __typename
        }
        ... on Mirror {
          ...MirrorFields
          __typename
        }
        __typename
      }
      hidden
      createdAt
      __typename
    }
    ... on Mirror {
      ...MirrorFields
      __typename
    }
    __typename
  }
  __typename
}

fragment MirrorFields on Mirror {
  id
  profile {
    ...ProfileFields
    __typename
  }
  reaction(request: $reactionRequest)
  hasCollectedByMe
  isGated
  isDataAvailability
  dataAvailabilityProofs
  canComment(profileId: $profileId) {
    result
    __typename
  }
  canMirror(profileId: $profileId) {
    result
    __typename
  }
  canDecrypt(profileId: $profileId) {
    result
    reasons
    __typename
  }
  collectModule {
    ...CollectModuleFields
    __typename
  }
  stats {
    ...StatsFields
    __typename
  }
  metadata {
    ...MetadataFields
    __typename
  }
  hidden
  mirrorOf {
    ... on Post {
      ...PostFields
      __typename
    }
    ... on Comment {
      id
      profile {
        ...ProfileFields
        __typename
      }
      collectNftAddress
      reaction(request: $reactionRequest)
      mirrors(by: $profileId)
      bookmarked(by: $profileId)
      notInterested(by: $profileId)
      onChainContentURI
      isGated
      isDataAvailability
      dataAvailabilityProofs
      canComment(profileId: $profileId) {
        result
        __typename
      }
      canMirror(profileId: $profileId) {
        result
        __typename
      }
      canDecrypt(profileId: $profileId) {
        result
        reasons
        __typename
      }
      stats {
        ...StatsFields
        __typename
      }
      createdAt
      __typename
    }
    __typename
  }
  createdAt
  appId
  __typename
}
`
        }
    })

    return (res.data.data.publications && res.data.data.publications.items.length) ? res.data.data.publications.items : []
}

export const getPublicationDetail = async (PublicationId: string):Promise<null | LensPublication> => {
    const res = await fetch.post({
        url: lensApi,
        data: {
            operationName: 'Publication',
            variables: {
                request: {
                    publicationId: PublicationId
                }
            },
            query: `query Publication($request: PublicationQueryRequest!, $reactionRequest: ReactionFieldResolverRequest, $profileId: ProfileId) {
  publication(request: $request) {
    ... on Post {
      ...PostFields
      collectNftAddress
      profile {
        isFollowedByMe
        __typename
      }
      referenceModule {
        __typename
      }
      __typename
    }
    ... on Comment {
      ...CommentFields
      collectNftAddress
      profile {
        isFollowedByMe
        __typename
      }
      referenceModule {
        __typename
      }
      __typename
    }
    ... on Mirror {
      ...MirrorFields
      collectNftAddress
      profile {
        isFollowedByMe
        __typename
      }
      referenceModule {
        __typename
      }
      __typename
    }
    __typename
  }
}

fragment PostFields on Post {
  id
  profile {
    ...ProfileFields
    __typename
  }
  reaction(request: $reactionRequest)
  mirrors(by: $profileId)
  bookmarked(by: $profileId)
  notInterested(by: $profileId)
  hasCollectedByMe
  onChainContentURI
  isGated
  isDataAvailability
  dataAvailabilityProofs
  canComment(profileId: $profileId) {
    result
    __typename
  }
  canMirror(profileId: $profileId) {
    result
    __typename
  }
  canDecrypt(profileId: $profileId) {
    result
    reasons
    __typename
  }
  collectModule {
    ...CollectModuleFields
    __typename
  }
  stats {
    ...StatsFields
    __typename
  }
  metadata {
    ...MetadataFields
    __typename
  }
  hidden
  createdAt
  appId
  __typename
}

fragment ProfileFields on Profile {
  id
  name
  handle
  bio
  ownedBy
  isFollowedByMe
  stats {
    totalFollowers
    totalFollowing
    totalPosts
    totalComments
    totalMirrors
    __typename
  }
  attributes {
    traitType
    key
    value
    __typename
  }
  picture {
    ... on MediaSet {
      original {
        url
        __typename
      }
      __typename
    }
    ... on NftImage {
      uri
      tokenId
      contractAddress
      chainId
      __typename
    }
    __typename
  }
  coverPicture {
    ... on MediaSet {
      original {
        url
        __typename
      }
      __typename
    }
    __typename
  }
  followModule {
    __typename
  }
  __typename
}

fragment CollectModuleFields on CollectModule {
  ... on FreeCollectModuleSettings {
    type
    contractAddress
    followerOnly
    __typename
  }
  ... on FeeCollectModuleSettings {
    type
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on LimitedFeeCollectModuleSettings {
    type
    collectLimit
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on LimitedTimedFeeCollectModuleSettings {
    type
    collectLimit
    endTimestamp
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on TimedFeeCollectModuleSettings {
    type
    endTimestamp
    referralFee
    contractAddress
    followerOnly
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    __typename
  }
  ... on MultirecipientFeeCollectModuleSettings {
    type
    optionalCollectLimit: collectLimit
    optionalEndTimestamp: endTimestamp
    referralFee
    followerOnly
    contractAddress
    amount {
      ...ModuleFeeAmountFields
      __typename
    }
    recipients {
      recipient
      split
      __typename
    }
    __typename
  }
  ... on SimpleCollectModuleSettings {
    type
    optionalCollectLimit: collectLimit
    optionalEndTimestamp: endTimestamp
    contractAddress
    followerOnly
    fee {
      amount {
        ...ModuleFeeAmountFields
        __typename
      }
      recipient
      referralFee
      __typename
    }
    __typename
  }
  __typename
}

fragment ModuleFeeAmountFields on ModuleFeeAmount {
  asset {
    symbol
    decimals
    address
    __typename
  }
  value
  __typename
}

fragment StatsFields on PublicationStats {
  totalUpvotes
  totalAmountOfMirrors
  totalAmountOfCollects
  totalBookmarks
  commentsTotal(customFilters: GARDENERS)
  __typename
}

fragment MetadataFields on MetadataOutput {
  name
  content
  image
  tags
  attributes {
    traitType
    value
    __typename
  }
  cover {
    original {
      url
      __typename
    }
    __typename
  }
  media {
    original {
      url
      mimeType
      __typename
    }
    __typename
  }
  encryptionParams {
    accessCondition {
      or {
        criteria {
          ...SimpleConditionFields
          and {
            criteria {
              ...SimpleConditionFields
              __typename
            }
            __typename
          }
          or {
            criteria {
              ...SimpleConditionFields
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}

fragment SimpleConditionFields on AccessConditionOutput {
  nft {
    contractAddress
    chainID
    contractType
    tokenIds
    __typename
  }
  eoa {
    address
    __typename
  }
  token {
    contractAddress
    amount
    chainID
    condition
    decimals
    __typename
  }
  follow {
    profileId
    __typename
  }
  collect {
    publicationId
    thisPublication
    __typename
  }
  __typename
}

fragment CommentFields on Comment {
  id
  profile {
    ...ProfileFields
    __typename
  }
  reaction(request: $reactionRequest)
  mirrors(by: $profileId)
  bookmarked(by: $profileId)
  notInterested(by: $profileId)
  hasCollectedByMe
  onChainContentURI
  isGated
  isDataAvailability
  dataAvailabilityProofs
  canComment(profileId: $profileId) {
    result
    __typename
  }
  canMirror(profileId: $profileId) {
    result
    __typename
  }
  canDecrypt(profileId: $profileId) {
    result
    reasons
    __typename
  }
  collectModule {
    ...CollectModuleFields
    __typename
  }
  stats {
    ...StatsFields
    __typename
  }
  metadata {
    ...MetadataFields
    __typename
  }
  hidden
  createdAt
  appId
  commentOn {
    ... on Post {
      ...PostFields
      __typename
    }
    ... on Comment {
      id
      profile {
        ...ProfileFields
        __typename
      }
      reaction(request: $reactionRequest)
      mirrors(by: $profileId)
      bookmarked(by: $profileId)
      notInterested(by: $profileId)
      hasCollectedByMe
      onChainContentURI
      isGated
      isDataAvailability
      dataAvailabilityProofs
      canComment(profileId: $profileId) {
        result
        __typename
      }
      canMirror(profileId: $profileId) {
        result
        __typename
      }
      canDecrypt(profileId: $profileId) {
        result
        reasons
        __typename
      }
      collectModule {
        ...CollectModuleFields
        __typename
      }
      metadata {
        ...MetadataFields
        __typename
      }
      stats {
        ...StatsFields
        __typename
      }
      mainPost {
        ... on Post {
          ...PostFields
          __typename
        }
        ... on Mirror {
          ...MirrorFields
          __typename
        }
        __typename
      }
      hidden
      createdAt
      __typename
    }
    ... on Mirror {
      ...MirrorFields
      __typename
    }
    __typename
  }
  __typename
}

fragment MirrorFields on Mirror {
  id
  profile {
    ...ProfileFields
    __typename
  }
  reaction(request: $reactionRequest)
  hasCollectedByMe
  isGated
  isDataAvailability
  dataAvailabilityProofs
  canComment(profileId: $profileId) {
    result
    __typename
  }
  canMirror(profileId: $profileId) {
    result
    __typename
  }
  canDecrypt(profileId: $profileId) {
    result
    reasons
    __typename
  }
  collectModule {
    ...CollectModuleFields
    __typename
  }
  stats {
    ...StatsFields
    __typename
  }
  metadata {
    ...MetadataFields
    __typename
  }
  hidden
  mirrorOf {
    ... on Post {
      ...PostFields
      __typename
    }
    ... on Comment {
      id
      profile {
        ...ProfileFields
        __typename
      }
      collectNftAddress
      reaction(request: $reactionRequest)
      mirrors(by: $profileId)
      bookmarked(by: $profileId)
      notInterested(by: $profileId)
      onChainContentURI
      isGated
      isDataAvailability
      dataAvailabilityProofs
      canComment(profileId: $profileId) {
        result
        __typename
      }
      canMirror(profileId: $profileId) {
        result
        __typename
      }
      canDecrypt(profileId: $profileId) {
        result
        reasons
        __typename
      }
      stats {
        ...StatsFields
        __typename
      }
      createdAt
      __typename
    }
    __typename
  }
  createdAt
  appId
  __typename
}
`
        }
    })

    return res.data.data.publication || null
}

