import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";
import {useState} from "react";
import '@/styles/index.sass'

import AmountInput from "./AmountInput";

const meta: Meta<typeof AmountInput> = {
    component: AmountInput,
};

type Story = StoryObj<typeof AmountInput>;

export default meta;

export const Render: Story = {
    render: function Test() {
        const [value, setValue] = useState(0)

        return <StyleProvider>
            <AmountInput
                value={value}
                onChange={(res) => {
                    setValue(res as number)
                }}/>

            <div>Value: {value}</div>
        </StyleProvider>
    }
}
