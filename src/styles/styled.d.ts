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
		};
		media: {
			mobile: (...args: BackQuoteArgs) => CSSProp | undefined;
			smallTablet: (...args: BackQuoteArgs) => CSSProp | undefined;
			wideTablet: (...args: BackQuoteArgs) => CSSProp | undefined;
			smallDesktop: (...args: BackQuoteArgs) => CSSProp | undefined;
			wideDesktop: (...args: BackQuoteArgs) => CSSProp | undefined;
		};
	}
}
