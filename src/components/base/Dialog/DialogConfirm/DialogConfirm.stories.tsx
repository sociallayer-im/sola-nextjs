import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import DialogProvider from "@/components/provider/DialogProvider/DialogProvider";

import Component from './DialogConfirm'

const meta: Meta<typeof Component> = {
    component: Component,
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <DialogProvider>
                <Component
                    title='This is a confirm dialog'
                    content='Are you sure?'
                    onConfirm={() => { alert('confirm')}}
                    onCancel={() => { alert('cancel') }}
                />
            </DialogProvider>
        </StyleProvider>
    }
}
