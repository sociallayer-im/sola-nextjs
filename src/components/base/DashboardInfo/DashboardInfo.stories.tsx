import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import '@/styles/index.sass'

import Component from './DashboardInfo'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        groupid: 1961
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
