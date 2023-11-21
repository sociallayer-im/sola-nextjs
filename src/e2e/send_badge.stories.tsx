import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import Providers from './providers'

import SendBadgeForm from '../pages/create-badge/NonPrefill'

function Page () {
    return <Providers>
        <SendBadgeForm />
    </Providers>
}

const meta: Meta<typeof SendBadgeForm> = {
    component: Page as any,
    parameters: {
        nextjs: {
            appDirectory: true,
        },
    },
};

export default meta;
type Story = StoryObj<typeof SendBadgeForm>;

// @ts-ignore
export const SendBadge: Story = {
   play: async ({ canvasElement  }) => {
       const canvas = within(canvasElement);
       await expect(
           canvas.getByText(
               '创建徽章'
           )
       ).toBeInTheDocument();
   }
}
