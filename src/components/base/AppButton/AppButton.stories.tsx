import type {Meta, StoryObj} from '@storybook/react';
import StyleProvider from "@/stories/StyleProvider";

import Component from './AppButton'

const meta: Meta<typeof Component> = {
    component: Component,
    args: {
        children: 'This is a button'
    }
};


type Story = StoryObj<typeof Component>;

export default meta;

export const Basic: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} />
        </StyleProvider>
    }
}

export const Inline: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} inline={true}/>
        </StyleProvider>
    }
}

export const Primary: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} kind={'primary'}/>
        </StyleProvider>
    }
}

export const Special: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} special={true} />
        </StyleProvider>
    }
}

export const Loading: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} isLoading={true}/>
        </StyleProvider>
    }
}

export const Disable: Story = {
    render: function Test(args: any, context) {
        return <StyleProvider>
            <Component {...args} disabled={true}/>
        </StyleProvider>
    }
}
