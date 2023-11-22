import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";

import Component from './AppSlider'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        value: [50],
        min:10,
        step: 1
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Basic: Story = {
    render: function Test(args: any, context) {
        const [res, setRes] = useState<any>([10])
        const [res2, setRes2] = useState<any>([10])
        return <StyleProvider>
            <Component {...args}
                       value={res}
                       onChange={res => {setRes(res)}}
                       onFinalChange={res => {setRes2(res)}}
            />
            <div>output: {res ? JSON.stringify(res) : ''}</div>
            <div>final output: {res2 ? JSON.stringify(res2) : ''}</div>
        </StyleProvider>
    }
}
