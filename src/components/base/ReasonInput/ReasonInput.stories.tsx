import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";

import Component from './ReasonInput'

const meta: Meta<typeof Component> = {
    component: Component,
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {
    render: function Test(args: any, context) {
        const [value, setValue] = useState('')
        return <StyleProvider>
            <Component {...args} placeholder={'input'} value={value} onChange={(v) => {
                setValue(v)
            }}/>
            <div>output:</div>
            <div>{JSON.stringify(value)}
            </div>
        </StyleProvider>
    }
}

export const Link: Story = {
    render: function Test(args: any, context) {
        const [value, setValue] = useState('this is a link : @https://www.google.com')
        return <StyleProvider>
            <Component {...args} placeholder={'input'} value={value} onChange={(v) => {
                setValue(v)
            }}/>
            <div>output:</div>
            <div>{JSON.stringify(value)}
            </div>
        </StyleProvider>
    }
}
