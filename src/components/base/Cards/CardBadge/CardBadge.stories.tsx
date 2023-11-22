import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import '@/styles/index.sass'

import Component from './CardBadge'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        badge: {
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
            "permissions": [],
            "hashtags": [],
            "created_at": "2023-11-21T07:18:13.017Z",
            "unlocking": null,
            "counter": 2,
            "group": null,
            "sender": {
                "id": 1,
                "address": "0x0b23E3588c906C3F723C58Ef4d6baEe7840A977c",
                "email": "bluecosmos001@gmail.com",
                "domain": "zfd.sociallayer.im",
                "image_url": "https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/fc6d67ml_E3AOMgk66"
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
