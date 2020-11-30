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
		mobile: (...args: BackQuoteArgs): undefined => undefined,
		smallTablet: (...args: BackQuoteArgs): undefined => undefined,
		wideTablet: (...args: BackQuoteArgs): undefined => undefined,
		smallDesktop: (...args: BackQuoteArgs): undefined => undefined,
		wideDesktop: (...args: BackQuoteArgs): undefined => undefined,
	},
};

const sizes: { [key: string]: number } = {
	mobile: 320,
	// 599px ~ 320px

	smallTablet: 600,
	// 839px ~ 600px

	wideTablet: 840,
	// 1023px ~ 840px

	smallDesktop: 1024,
	// 1365px ~ 1024px

	wideDesktop: 1366,
	//  1920px ~ 1366px
};

Object.keys(sizes).reduce((media: DefaultTheme['media'], label: string) => {
	switch (label) {
		default:
			break;
		case 'mobile':
			media.mobile = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.smallTablet - 1}px) {
						${args}
					}
				`;
			break;
		case 'smallTablet':
			media.smallTablet = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.wideTablet -
						1}px) and (min-width: ${sizes.smallTablet}px) {
						${args}
					}
				`;
			break;
		case 'wideTablet':
			media.wideTablet = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.smallDesktop -
						1}px) and (min-width: ${sizes.wideTablet}px) {
						${args}
					}
				`;
			break;
		case 'smallDesktop':
			media.smallDesktop = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (max-width: ${sizes.wideDesktop -
						1}px) and (min-width: ${sizes.smallDesktop}px) {
						${args}
					}
				`;
			break;
		case 'wideDesktop':
			media.wideDesktop = (...args: BackQuoteArgs) =>
				css`
					@media only screen and (min-width: ${sizes.wideDesktop}px) {
						${args}
					}
				`;
			break;
	}
	return media;
}, theme.media);

export default theme;
