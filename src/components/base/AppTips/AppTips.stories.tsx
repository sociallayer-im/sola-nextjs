import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";

import Component from './AppTips'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        text: 'this is tips'
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Basic: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
          Hover to show :  <Component {...args} />
        </StyleProvider>
    }
}
