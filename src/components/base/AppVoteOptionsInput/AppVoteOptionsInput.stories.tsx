import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import DialogProvider from "@/components/provider/DialogProvider/DialogProvider";

import Component from './AppVoteOptionsInput'
import '@/styles/index.sass'

const meta: Meta<typeof Component> = {
    component: Component,
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Basic: Story = {
    render: function Test(args: any, context) {
        const [res, setRes] = useState<any>([])
        return <StyleProvider>
            <DialogProvider>
                <Component {...args}
                           value={res}
                           onChange={res => {
                               setRes(res)
                           }}
                />
                <div>output: {res ? JSON.stringify(res) : ''}</div>
            </DialogProvider>
        </StyleProvider>
    }
}

export const Edit: Story = {
    render: function Test(args: any, context) {
        const [res, setRes] = useState<any>([{"title":"asdasdasd","link":"asdasdasd"},{"title":"asdasdasd","link":"1111"}])
        return <StyleProvider>
            <DialogProvider>
                <Component {...args}
                           value={res}
                           onChange={res => {
                               setRes(res)
                           }}
                />
                <div>output: {res ? JSON.stringify(res) : ''}</div>
            </DialogProvider>
        </StyleProvider>
    }
}
