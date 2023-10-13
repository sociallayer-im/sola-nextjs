const twitterRegex = /^https?:\/\/(?:www\.)?twitter\.com\/([A-Za-z0-9_]{1,15})\/?$/;
const telegramRegex = /^https?:\/\/(?:www\.)?t\.me\/([A-Za-z0-9_]{1,15})\/?$/;
const githubRegex = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_]{1,15})\/?$/;
const ensRegex = /^https?:\/\/app\.ens\.domains\/([A-Za-z0-9_\.]{1,32})\/?$/;
const lensRegex = /^https?:\/\/(?:www\.)?lenster\.xyz\/u\/([A-Za-z0-9_]{1,15})\/?$/;

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

        return socialMedia
    }

    return {url2Id, id2Url}
}

export default useSocialMedia
