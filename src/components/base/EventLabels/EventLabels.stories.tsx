import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import '@/styles/index.sass'

import Component from './EventLabels'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        data: [
            "公益课",
            "工作坊",
            "讲座沙龙",
            "人工智能",
            "区块链",
            "创作者经济",
            "社群与协作",
            "身心可持续",
            "坞民日常",
            "山海讲堂"
        ],
        value: []
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {}

export const Selected: Story = {
    render: function Test(args: any, context) {
        const [value, setValue] = useState(['公益课'])
        return <StyleProvider>
            <Component {...args} value={value} onChange={(v) => {
                setValue(v)
            }}
            />
            <div>output:</div>
            <div>{JSON.stringify(value)}</div>
        </StyleProvider>
    }
}
