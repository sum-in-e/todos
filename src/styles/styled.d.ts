import 'styled-components';
import { CSSProp } from 'styled-components';

declare module 'styled-components' {
	export interface DefaultTheme {
		light: {
			greenColor: string;
			yellowColor: string;
			grayColor: string;
			blackColor: string;
			whiteColor: string;
			redColor: string;
		};
		media: {
			portraitMobile: (...args: BackQuoteArgs) => CSSProp | undefined;
			landscapeMobile: (...args: BackQuoteArgs) => CSSProp | undefined;
			portraitTabletS: (...args: BackQuoteArgs) => CSSProp | undefined;
			portraitTablet: (...args: BackQuoteArgs) => CSSProp | undefined;
			landscapeTablet: (...args: BackQuoteArgs) => CSSProp | undefined;
			desktop: (...args: BackQuoteArgs) => CSSProp | undefined;
		};
	}
}
