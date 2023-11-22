import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import '@/styles/index.sass'
import 'swiper/css'
import 'swiper/css/pagination'

import Component from './AppSwiper'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        items: [<div key={1} style={{background: 'red'}}>1</div>,
            <div key={2} style={{background: 'green'}}>2</div>,
            <div key={3} style={{background: 'yellow'}}>3</div>],
        itemWidth: 100,
        space: 10,
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <div style={{width: '100px', height: '100px'}}>
                <Component {...args} />
            </div>
        </StyleProvider>
    }
}
