import type {Meta, StoryObj} from '@storybook/react';
import {profiles} from '@/stories/mock'
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import {Profile} from "@/service/solas";


import AddressList from "@/components/base/AddressList/AddressList";

const meta: Meta<typeof AddressList> = {
    component: AddressList,
};

type Story = StoryObj<typeof AddressList>;

export default meta;

export const Basic: Story = {
    render: () => <StyleProvider>
        <AddressList data={profiles}/>,
    </StyleProvider>
}

export const Selected: Story = {
    render: () => <StyleProvider>
        <AddressList data={profiles} selected={[1]}/>,
    </StyleProvider>
}

export const OnClick: Story = {
    render: function Test() {
        const [res, setRes] = useState<Profile | null>(null)

        return <StyleProvider>
            <AddressList
                selected={res ? [res.id] : []}
                data={profiles}
                onClick={(res) => {
                    setRes(res)
                }}/>

            <div>{res ? JSON.stringify(res) : 'click to select'}</div>
        </StyleProvider>
    }
}
