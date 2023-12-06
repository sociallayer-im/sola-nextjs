import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useContext, useEffect, useState} from "react";
import UserProvider from '@/stories/UserProvider'

import Component from './CardVote'
import userContext from "@/components/provider/UserProvider/UserContext";
import DialogProvider from "@/components/provider/DialogProvider/DialogProvider";
import '@/styles/index.sass'

const meta: Meta<typeof Component> = {
    component: Component,
    parameters: {
        nextjs: {
            appDirectory: true,
        },
    },
    args: {
        item: {
            "id": 27,
            "title": "wanna vote 2",
            "content": "wanna vote 2",
            "group_id": 1516,
            "creator_id": 252,
            "show_voter": false,
            "max_choice": 1,
            "eligibile_group_id": 1516,
            "eligibile_badge_id": null,
            "eligibile_point_id": null,
            "verification_strategy": null,
            "eligibility": "has_group_membership",
            "status": null,
            "result": null,
            "can_update_vote": false,
            "voter_count": 2,
            "weight_count": 2,
            "start_time": "2023-09-25T12:00:00.000Z",
            "ending_time": null,
            "options": [
                {
                    "id": 72,
                    "title": "op1",
                    "link": null,
                    "content": null,
                    "image_url": null,
                    "weight": 2
                },
                {
                    "id": 73,
                    "title": "opt2",
                    "link": null,
                    "content": null,
                    "image_url": null,
                    "weight": 0
                }
            ]
        }
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {}

const ComponentWithState = (args: any) => {
    const {setUser} = useContext(userContext)

    useEffect(() => {
        setUser({
            id: 1,
        })
    }, [])

    return <Component {...args} />
}

export const Voted: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <UserProvider>
                <DialogProvider>
                    <ComponentWithState {...args} />
                </DialogProvider>
            </UserProvider>
        </StyleProvider>
    }
}
