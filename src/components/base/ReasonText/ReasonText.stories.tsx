import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import '@/styles/index.sass'

import Component from './ReasonText'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        text: 'show text, link @https://www.google.com, hash tag: #hashTag',
    }
} as any;


type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {}
