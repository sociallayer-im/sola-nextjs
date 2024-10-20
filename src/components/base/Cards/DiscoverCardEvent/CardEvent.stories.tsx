import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import '@/styles/index.sass'

import Component from './CardEvent'
import UserProvider from "@/components/provider/UserProvider/UserProvider";
import {configureChains, createConfig, WagmiConfig} from "wagmi";
import {mainnet} from "wagmi/chains";
import {publicProvider} from 'wagmi/providers/public'
import {useContext, useEffect} from "react";
import userContext from "@/components/provider/UserProvider/UserContext";

const eventData = {
    "id": 799,
    "title": "test timezone2",
    "category": null,
    "tags": [],
    "top": false,
    "start_time": new Date().toISOString(),
    "ending_time": new Date(new Date().getTime() + 1000 * 60 * 60).toISOString(),
    "timezone": "Europe/Istanbul",
    "location_type": "both",
    "location": "",
    "online_location": null,
    "location_details": "",
    "owner_id": 1,
    "group_id": 1516,
    "content": "",
    "cover": "https://ik.imagekit.io/soladata/m3iabmrc_FxTjZnP9Q",
    "status": "open",
    "participants_count": 0,
    "checklogs_count": 0,
    "event_type": "event",
    "max_participant": null,
    "min_participant": null,
    "badge_id": null,
    "need_approval": null,
    "host_info": null,
    "repeat_event_id": null,
    "created_at": "2023-11-08T07:44:10.415Z",
    "updated_at": "2023-11-08T07:44:10.440Z",
    "event_site": {
        "id": 22,
        "title": "华南理工大学",
        "location": "",
        "location_details": "{\"formatted_address\":\"中国广东省广州市番禺区外环东路382号 邮政编码: 511436\",\"geometry\":{\"location\":{\"lat\":23.047819,\"lng\":113.406609},\"viewport\":{\"south\":23.0464663197085,\"west\":113.4052814197085,\"north\":23.0491642802915,\"east\":113.4079793802915}},\"name\":\"华南理工大学大学城校区\",\"html_attributions\":[]}",
        "about": "",
        "group_id": 1516,
        "owner_id": 46,
        "created_at": "2023-09-29T09:41:32.307Z"
    },
    "event_owner": {
        "id": 1,
        "username": "zfd",
        "nickname": "zfd",
        "image_url": "https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/fc6d67ml_E3AOMgk66"
    }
}

const meta: Meta<typeof Component> = {
    component: Component,
    parameters: {
        nextjs: {
            appDirectory: true,
        },
    },
    args: {
        event: eventData
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

export const Past: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} event={{
                ...eventData,
                start_time: "2023-11-08T07:44:10.415Z",
                ending_time: "2023-11-08T13:45:00.000Z"
            } as any}/>
        </StyleProvider>
    }
}

export const Applied: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args}
                       attend={true}
                       event={{
                           ...eventData,
                           start_time: "2023-11-08T07:44:10.415Z",
                           ending_time: "2023-11-08T13:45:00.000Z"
                       } as any}/>
        </StyleProvider>
    }
}

const {chains, publicClient, webSocketPublicClient} = configureChains(
    [mainnet],
    [publicProvider()],
)

const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
})

const ComponentWithConfig = (props: any) => {
    const {setUser} = useContext(userContext)

    useEffect(() => {
        setUser({
            id: 1
        })
    },[])

    return <Component {...props}/>
}

export const Host: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <WagmiConfig config={config as any}>
                <UserProvider>
                    <ComponentWithConfig {...args}
                               attend={true}
                               event={{
                                   ...eventData,
                                   start_time: "2023-11-08T07:44:10.415Z",
                                   ending_time: "2023-11-08T13:45:00.000Z"
                               } as any}/>
                </UserProvider>
            </WagmiConfig>
        </StyleProvider>
    }
}
