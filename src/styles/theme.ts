import { DefaultTheme } from 'styled-components';
import { css } from 'styled-components';

type BackQuoteArgs = string[];

const theme: DefaultTheme = {
	light: {
		greenColor: '#135046',
		yellowColor: '#FFBE49',
		grayColor: '#caccd1',
		blackColor: '#1C1C1C',
		whiteColor: '#FFFFFF',
	},
	media: {
		portraitMobile: (...args: BackQuoteArgs): undefined => undefined,
		landscapeMobile: (...args: BackQuoteArgs): undefined => undefined,
		portraitTablet: (...args: BackQuoteArgs): undefined => undefined,
		landscapeTablet: (...args: BackQuoteArgs): undefined => undefined,
		desktop: (...args: BackQuoteArgs): undefined => undefined,
	},
};

const sizes: { [key: string]: number } = {
	/*  Smartphones in portrait mode -> max-width : 420 */
	portraitMobile: 420,
	/*  Smartphones in landscape mode -> 421x767 */
	landscapeMobile: 767,
	/*  Tablets in portrait mode, large display smartphones landscape mode -> 768X1023 */
	portraitTablet: 1023,
	/*  Tablets in landscape mode, older desktop monitors -> 1024X1365 */
	landscapeTablet: 1365,
	/* Monitors with screen width 1366px or above -> 1366 and above */
	desktop: 1366,
};

Object.keys(sizes).reduce((media: DefaultTheme['media'], label: string) => {
	switch (label) {
		default:
			break;
		case 'portraitMobile':
			media.portraitMobile = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.portraitMobile}px) {
						${args}
					}
				`;
			break;
		case 'landscapeMobile':
			media.landscapeMobile = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.landscapeMobile}px) and (min-width: ${sizes.portraitMobile +
						1}px) {
						${args}
					}
				`;
			break;
		case 'portraitTablet':
			media.portraitTablet = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.portraitTablet}px) and (min-width: ${sizes.landscapeMobile +
						1}px) {
						${args}
					}
				`;
			break;
		case 'landscapeTablet':
			media.landscapeTablet = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.landscapeTablet}px) and (min-width: ${sizes.portraitTablet +
						1}px) {
						${args}
					}
				`;
			break;
		case 'desktop':
			media.desktop = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (min-width: ${sizes.desktop}px) {
						${args}
					}
				`;
			break;
	}
	return media;
}, theme.media);

export default theme;
