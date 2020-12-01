import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

export const GlobalStyle = createGlobalStyle`
  ${normalize}

  @font-face {
    font-family: 'Eoe_Zno_L';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_eight@1.0/Eoe_Zno_L.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

  html,
  body {
    font-family: 'Eoe_Zno_L';
    overflow: hidden;
    ${({ theme }) => theme.media.mobile`
		font-size : 16px;
			`}
    ${({ theme }) => theme.media.smallTablet`
		font-size : 22px;
			`}
  }

  * {
    box-sizing: border-box;
  }
`;
