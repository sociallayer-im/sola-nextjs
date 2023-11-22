import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";

import Component from './AppFlexTextArea'

const meta: Meta<typeof Component> = {
    component: Component,
    args:{
        value: 'test'
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

export const Overflow: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <div style={{width: '300px'}}>
                <Component {...args}
                           value={'building 1/2 entries 80/85 dependencies 530/39 modulesUnexpected token (29:40)'} />
            </div>
        </StyleProvider>
    }
}
