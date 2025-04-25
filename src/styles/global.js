import { css } from '@linaria/core';

export const globalStyles = css`
  :global() {
    @font-face {
      font-family: 'Adderley';
      src: url('/src/assets/fonts/adderley_bold.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
      font-display: swap; /* Improves loading behavior */
    }
  }
`;