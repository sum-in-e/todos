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
    font-family: 'Eoe_Zno_L', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    overflow: hidden;
		font-size : 25px;
    background-color :${props => props.theme.light.mainColor};
    ${({ theme }) => theme.media.landscapeTablet`
				font-size : 27px;
	`}
    ${({ theme }) => theme.media.desktop`
				font-size : 27px;
	`}
  }

  * {
    box-sizing: border-box;
  }
`;
