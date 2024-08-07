const twitterRegex = /^https?:\/\/(?:www\.)?x\.com\/([A-Za-z0-9_]{1,15})\/?$/;
const telegramRegex = /^https?:\/\/(?:www\.)?t\.me\/([A-Za-z0-9_]{1,15})\/?$/;
const githubRegex = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_]{1,15})\/?$/;
const ensRegex = /^https?:\/\/app\.ens\.domains\/([A-Za-z0-9_\.]{1,32})\/?$/;
const lensRegex = /^https?:\/\/(?:www\.)?lenster\.xyz\/u\/([A-Za-z0-9_]{1,15})\/?$/;
const farcasterRegex = /^https?:\/\/warpcast\.com\/([A-Za-z0-9_]{1,15})\/?$/;

const tips: any = {
    twitter: 'eg. "https://twitter.com/xxxx"  \nor username "xxx" without "@"',
    telegram: 'eg. ”https://t.me/xxx“ \nor username "xxx" without "@"' ,
    github:  'eg. "https://github.com/xxx" \nor username "xxx"',
    ens: 'eg. "https://app.ens.domains/xxx.eth" \nor domain "xxx.eth"',
    lens: 'eg. "https://lenster.xyz/u/xxx" \nor lens handel "xxx"  without "@"',
    farcaster: 'eg. "https://warpcast.com/xxx" \nor username "xxx" without "@"',
}

function useSocialMedia () {
    const url2Id = (socialMedia: string, type: string) => {

        // 处理 twitter 链接获取 twitter id
        if (type === 'twitter') {
            const match = socialMedia.match(twitterRegex);
            if (match && match[1]) {
                return match[1];
            }
            return socialMedia;
        }

        // 处理 telegram 链接获取 telegram id
        if (type === 'telegram') {
            const match = socialMedia.match(telegramRegex);
            if (match && match[1]) {
                return match[1];
            }
            return socialMedia;
        }

        // 处理 github 链接获取 github id
        if (type === 'github') {
            const match = socialMedia.match(githubRegex);
            if (match && match[1]) {
                return match[1];
            }
            return socialMedia;
        }

        // 处理 discord 链接获取 discord id
        if (type === 'discord') {
            return socialMedia;
        }

        // 处理 ens 链接获取 ens id
        if (type === 'ens') {
            const match = socialMedia.match(ensRegex);
            if (match && match[1]) {
                return match[1];
            }
            return socialMedia;
        }

        // 处理 web
        if (type === 'web') {
            return socialMedia;
        }

        // 处理 nostr
        if (type === 'nostr') {
            return socialMedia;
        }

        // 处理 nostr
        if (type === 'lens') {
            const match = socialMedia.match(lensRegex);
            if (match && match[1]) {
                return match[1];
            }
            return socialMedia;
        }

        if (type === 'farcaster') {
            const match = socialMedia.match(farcasterRegex);
            console.log('farcaster', match)
            if (match && match[1]) {
                return match[1];
            }
            return socialMedia;
        }

        return socialMedia
    }

    const id2Url = (socialMedia: string, type: string) => {
        if (type === 'twitter') {
            if (socialMedia.includes('twitter.com')) return socialMedia;
            return `https://twitter.com/${socialMedia}`;
        }

        if (type === 'telegram') {
            if (socialMedia.includes('t.me')) return socialMedia;
            return `https://t.me/${socialMedia}`;
        }

        if (type === 'github') {
            if (socialMedia.includes('github.com')) return socialMedia;
            return `https://github.com/${socialMedia}`;
        }

        if (type === 'discord') {
            return socialMedia;
        }

        if (type === 'ens') {
            if (socialMedia.includes('app.ens.domains')) return socialMedia;
            return `https://app.ens.domains/${socialMedia}`;
        }

        if (type === 'web') {
            return socialMedia;
        }

        if (type === 'nostr') {
            return socialMedia;
        }

        if (type === 'lens') {
            if (socialMedia.includes('lenster.xyz')) return socialMedia;
            return `https://lenster.xyz/u/${socialMedia}`;
        }

        if (type === 'farcaster') {
            if (socialMedia.includes('warpcast.com')) return socialMedia;
            return `https://warpcast.com/${socialMedia}`;
        }

        return socialMedia
    }

    const getTips = (type: string) => {
        return tips[type]
    }

    return {url2Id, id2Url, getTips}
}

export default useSocialMedia
