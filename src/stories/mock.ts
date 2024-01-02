import {Profile} from "@/service/solas";

export const walletLogin = () => {
    window.localStorage.setItem('auth_sola', '[["0x0b23E3588c906C3F723C58Ef4d6baEe7840A977c","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIxIn19.on89jGySJpDjdsEqdEeJ6ycIQIZodnUMlmsSPZUrnqc"]]')
    window.localStorage.setItem('lastLoginType', 'wallet')
    window.localStorage.setItem('lang', 'en')
}

export const profiles: any = [
    {
        address: '0x0b23E3588c906C3F723C58Ef4d6baEe7840A977c',
        domain: 'zfd.sociallayer.im',
        id: 1,
        image_url: 'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/fc6d67ml_E3AOMgk66',
        email: null,

        twitter: null,
        telegram: null,
        github: null,
        discord: null,
        ens: null,
        lens: null,
        website: null,
        nostr: null,
        location: null,
        about: null,
        nickname: null,

        username: 'zfd',
        followers: 0,
        following: 0,
        badge_count: 95,
        status: 'active',
        permissions: [
            "nftpass",
            "private",
            "gift",
            "point"
        ],
        group_event_visibility: 'public',
        event_tags: [],
        group_map_enabled: true,
        banner_image_url: null,
        banner_link_url: null,
        group_location_details: null,
    },
    {
        address: '0x0b23E3588c906C3F723C58Ef4d6baEe7840A977c',
        domain: 'zfd2.sociallayer.im',
        id: 2,
        image_url: null,
        email: null,

        twitter: null,
        telegram: null,
        github: null,
        discord: null,
        ens: null,
        lens: null,
        website: null,
        nostr: null,
        location: null,
        about: null,
        nickname: null,

        username: 'zfd2',
        followers: 0,
        following: 0,
        badge_count: 95,
        status: 'active',
        permissions: [
            "nftpass",
            "private",
            "gift",
            "point"
        ],
        group_event_visibility: 'public',
        event_tags: [],
        group_map_enabled: true,
        banner_image_url: null,
        banner_link_url: null,
        group_location_details: null,
    }
]
