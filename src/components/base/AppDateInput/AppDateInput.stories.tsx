import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";

import Component from './AppDateInput'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        value: new Date().toISOString()
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Basic: Story = {
    render: function Test(args, context) {
        return <StyleProvider>
            <Component {...args} />
        </StyleProvider>
    }
}

export const OnChange: Story = {
    render: function Test(args, context) {
        const [value, setValue] = useState(new Date().toISOString())

        return <StyleProvider>
            <Component {...args} value={value} onChange={res => {setValue(res)}}/>
            <div>Output: {value}</div>
        </StyleProvider>
    }
}
