import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import '@/styles/index.sass'

import Component from './DialogCropper'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        imgURL: 'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/fc6d67ml_E3AOMgk66'
    }
};

type Story = StoryObj<typeof Component>;

export default meta;

export const Render: Story = {
    render: function Test(args: any, context) {
        const [res, setRes] = useState<any>(null)
        return <StyleProvider>
            <div style={{width: '345px'}}>
                <Component {...args}
                           handleClose={() => {}}
                           handleConfirm={(data) => {
                               const a = new FileReader();
                               a.onload = function(e) {
                                   setRes(e.target!.result)
                               }
                               a.readAsDataURL(data);
                                (data)
                            }}
                />
            </div>
            <div>Result:</div>
            {
                !!res && <img src={res} alt="" width={200}/>
            }
        </StyleProvider>
    }
}
