import type { Preview } from "@storybook/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

const preview: Preview = {
  parameters: {
    nextRouter: {
      Provider: AppRouterContext.Provider, // next 13 next 13 (using next/navigation)
      // Provider: RouterContext.Provider, // next 13 (using next/router) / next < 12
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
