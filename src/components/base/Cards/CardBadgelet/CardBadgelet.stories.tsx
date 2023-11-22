import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import '@/styles/index.sass'

import Component from './CardBadgelet'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        badgelet: {
            "id": 2795,
            "badge_id": 1025,
            "hide": false,
            "top": false,
            "status": "accepted",
            "title": null,
            "image_url": null,
            "metadata": null,
            "content": "1700551081435",
            "hashtags": [],
            "chain_data": null,
            "subject_url": "",
            "domain": "1700551081435.zfd.sociallayer.im#1",
            "token_id": "0x8a3ce94fc8a6daa3d6dc3231135e15ab4200e3a6861194d993a5b19266314fb7",
            "created_at": "2023-11-21T07:18:15.876Z",
            "starts_at": null,
            "expires_at": null,
            "value": null,
            "last_consumed_at": null,
            "receiver": {
                "id": 1,
                "address": "0x0b23E3588c906C3F723C58Ef4d6baEe7840A977c",
                "email": "bluecosmos001@gmail.com",
                "domain": "zfd.sociallayer.im",
                "image_url": "https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/fc6d67ml_E3AOMgk66"
            },
            "owner": {
                "id": 1,
                "address": "0x0b23E3588c906C3F723C58Ef4d6baEe7840A977c",
                "email": "bluecosmos001@gmail.com",
                "domain": "zfd.sociallayer.im",
                "image_url": "https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/fc6d67ml_E3AOMgk66"
            },
            "sender": {
                "id": 1,
                "address": "0x0b23E3588c906C3F723C58Ef4d6baEe7840A977c",
                "email": "bluecosmos001@gmail.com",
                "domain": "zfd.sociallayer.im",
                "image_url": "https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/fc6d67ml_E3AOMgk66"
            },
            "badge": {
                "id": 1025,
                "name": "handle text badge 170055108143",
                "domain": "1700551081435.zfd.sociallayer.im",
                "title": "handle text badge 170055108143",
                "metadata": null,
                "content": "1700551081435",
                "badge_type": "badge",
                "image_url": "https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/cvs06g2n_kARAFJMkR",
                "token_id": "0xd8ccabd5b00780aabfdbd63d95c1d1f40ee442cad5df6986a530f8ab16624079",
                "subject_url": null,
                "hashtags": [],
                "unlocking": null,
                "counter": 2,
                "group": null
            }
        }
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} />
        </StyleProvider>
    }
}
