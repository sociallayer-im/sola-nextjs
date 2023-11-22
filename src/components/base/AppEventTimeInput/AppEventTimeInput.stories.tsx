import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import LangProvider from "@/components/provider/LangProvider/LangProvider";
import '@/styles/index.sass'

import Component from './AppEventTimeInput'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        from: new Date().toISOString(),
        to: new Date(new Date().getTime() + 1000 * 60 * 60 * 60).toISOString(),
        timezone: 'Asia/Shanghai',
        onChange: (from: string, to: string) => {
        }
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Basic: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <LangProvider>
                <Component {...args} />
            </LangProvider>
        </StyleProvider>
    }
}

export const OnChange: Story = {
    render: function Test(args: any, context) {
        const [res, setRes] = useState<any>(null)
        return <StyleProvider>
            <LangProvider>
                <Component {...args} onChange={res => {
                    setRes(res)
                }}/>
            </LangProvider>

            <div> output:</div>
            <div>{res ? JSON.stringify(res) : '--'}</div>
        </StyleProvider>
    }
}

export const NotArrowRepeat: Story = {
    render: function Test(args: any, context) {
        const [res, setRes] = useState<any>(null)
        return <StyleProvider>
            <LangProvider>
                <Component {...args}
                           arrowRepeat={false}
                           onChange={res => {
                               setRes(res)
                           }}/>
            </LangProvider>

            <div> output:</div>
            <div>{res ? JSON.stringify(res) : '--'}</div>
        </StyleProvider>
    }
}

export const AllDay: Story = {
    render: function Test(args: any, context) {
        const [res, setRes] = useState<any>(null)
        return <StyleProvider>
            <LangProvider>
                <Component {...args}
                           from={new Date(2023, 11, 11, 0, 0).toISOString()}
                           to={new Date(2023, 11, 11, 23, 59).toISOString()}
                           onChange={res => {
                               setRes(res)
                           }}/>
            </LangProvider>

            <div> output:</div>
            <div>{res ? JSON.stringify(res) : '--'}</div>
        </StyleProvider>
    }
}
