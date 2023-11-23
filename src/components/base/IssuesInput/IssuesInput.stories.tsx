import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useEffect, useState} from "react";
import '@/styles/index.sass'

import Component from './IssuesInput'

const meta: Meta<typeof Component> = {
    component: Component,
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {
    render: function Test(args: any, context) {
        const [value, setValue] = useState([''])
        return <StyleProvider>
            <Component {...args} placeholder={'input'} value={value} onChange={(v) => {
                setValue(v)
            }}/>
            <div>output:</div>
            <div>{JSON.stringify(value)}</div>
        </StyleProvider>
    }
}

export const Search: Story = {
    render: function Test(args: any, context) {
        const [value, setValue] = useState(['zfd'])
        useEffect(() => {
            setTimeout(() => {
                document.querySelector('input')?.focus()
            }, 1000)
        }, [])

        return <StyleProvider>
            <Component {...args} placeholder={'input'} value={value} onChange={(v) => {
                setValue(v)
            }}/>
            <div>output:</div>
            <div>{JSON.stringify(value)}</div>
        </StyleProvider>
    }
}
