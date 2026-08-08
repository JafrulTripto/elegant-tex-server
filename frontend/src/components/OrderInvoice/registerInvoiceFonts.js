import { Font } from '@react-pdf/renderer';
import CourierPrimeRegular from '../../assets/fonts/CourierPrime/CourierPrime-Regular.ttf';
import CourierPrimeBold from '../../assets/fonts/CourierPrime/CourierPrime-Bold.ttf';
import HindSiliguriRegular from '../../assets/fonts/HindSiliguri/HindSiliguri-Regular.ttf';
import HindSiliguriBold from '../../assets/fonts/HindSiliguri/HindSiliguri-Bold.ttf';

// react-pdf (3.x) does NOT fall back across font families for missing glyphs, and
// no monospace font covers Bengali. So the invoice is a hybrid: Courier Prime gives
// the typewriter look for the Latin chrome/numbers, and Hind Siliguri (Latin +
// Bengali) is applied to the user-data fields that can contain Bangla. Registered
// once here and shared by the invoice + the QR label.
Font.register({
  family: 'CourierPrime',
  fonts: [
    { src: CourierPrimeRegular },
    { src: CourierPrimeBold, fontWeight: 700 },
  ],
});
Font.register({
  family: 'HindSiliguri',
  fonts: [
    { src: HindSiliguriRegular },
    { src: HindSiliguriBold, fontWeight: 700 },
  ],
});
