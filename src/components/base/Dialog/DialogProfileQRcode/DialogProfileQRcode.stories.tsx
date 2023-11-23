import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import {profiles} from "@/stories/mock";

import Component from './DialogProfileQRcode'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        profile: profiles[0]
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {}
