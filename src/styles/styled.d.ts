import 'styled-components';
import { CSSProp } from 'styled-components';

declare module 'styled-components' {
	export interface DefaultTheme {
		light: {
			mainColor: string;
			subColor: string;
			lineColor: string;
			textColor: string;
			warnColor: string;
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
