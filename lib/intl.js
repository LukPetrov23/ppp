export const KNOWN_CURRENCIES = [
  'EUR',
  'AMD',
  'KZT',
  'KGS',
  'UZS',
  'USD',
  'CNY',
  'TJS',
  'BYN',
  'HKD',
  'XAU',
  'TRY',
  'XAG',
  'RUB'
];

export function stringToFloat(string) {
  if (typeof string === 'number') {
    return string;
  }

  if (!string) {
    return 0;
  }

  return parseFloat(
    string
      .replace(',', '.')
      .replace(/\s/g, '')
      .replace(/[^\x20-\x7E]/g, '')
  );
}

export function decimalSeparator() {
  const numberWithDecimalSeparator = 1.1;

  return Intl.NumberFormat('ru-RU')
    .formatToParts(numberWithDecimalSeparator)
    .find((part) => part.type === 'decimal').value;
}

export const decSeparator = decimalSeparator();

export function getInstrumentMinPriceIncrement(
  instrument,
  price,
  alwaysUsePrice
) {
  if (!instrument) return 0;

  price = stringToFloat(price);

  let pi = instrument.minPriceIncrement;

  if (!pi || alwaysUsePrice) {
    pi = price < 1 ? 0.0001 : 0.01;
  }

  return pi;
}

export function getInstrumentPrecision(instrument, price, alwaysUsePrice) {
  if (!instrument) return 0;

  if (instrument.type === 'currency') {
    return 4;
  }

  if (price === 0 || price === '0') {
    return 2;
  }

  const pi = getInstrumentMinPriceIncrement(instrument, price, alwaysUsePrice);

  const [dec, frac] = pi.toString().split('.');

  return frac ? frac.length : 0;
}

export function getInstrumentQuantityPrecision(instrument) {
  if (!instrument) return 0;

  const [dec, frac] = (instrument.minQuantityIncrement ?? 0)
    .toString()
    .split('.');

  return frac ? frac.length : 0;
}

export function formatDateWithOptions(date, options = {}) {
  if (!date) return '—';

  return new Intl.DateTimeFormat(
    'ru-RU',
    Object.assign(
      {
        hour12: false
      },
      options
    )
  ).format(new Date(date));
}

export function formatDate(date) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).format(new Date(date));
}

export function formatPrice(price, instrument, formatterOptions = {}) {
  if (!instrument || typeof price !== 'number' || isNaN(price)) return '—';

  if (!instrument.currency) return '—';

  const precision = getInstrumentPrecision(instrument, price);

  if (instrument.type === 'future' || instrument.type === 'index') {
    return (
      new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(price) + ' пт.'
    );
  }

  if (!KNOWN_CURRENCIES.includes(instrument?.currency)) {
    return (
      new Intl.NumberFormat(
        'ru-RU',
        Object.assign(
          {
            style: 'decimal',
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
          },
          formatterOptions
        )
      ).format(price) +
      (instrument.currency === 'N/A' ? '' : ` ${instrument.currency}`)
    );
  }

  return (
    new Intl.NumberFormat(
      'ru-RU',
      Object.assign(
        {
          style: 'decimal',
          currency: instrument.currency,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        },
        formatterOptions
      )
    ).format(price) + ` ${priceCurrencySymbol(instrument)}`
  );
}

export function formatPriceWithoutCurrency(
  price,
  instrument,
  derivePrecisionFromPrice
) {
  if (typeof instrument === 'undefined') {
    return (price || '').toString().replace('.', decSeparator);
  }

  if (typeof price !== 'number' || isNaN(price)) return '—';

  const precision = getInstrumentPrecision(
    instrument,
    price,
    derivePrecisionFromPrice
  );

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(price);
}

export function formatCommission(
  commission,
  instrument,
  formatterOptions = {}
) {
  if (!instrument || typeof commission !== 'number' || isNaN(commission))
    return '—';

  if (!instrument.currency) return '—';

  if (KNOWN_CURRENCIES.indexOf(instrument?.currency) === -1) {
    return (
      new Intl.NumberFormat(
        'ru-RU',
        Object.assign(
          {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 3
          },
          formatterOptions
        )
      ).format(commission) + ` ${instrument.currency}`
    );
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: instrument.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(commission);
}

export function formatAmount(amount, currency, instrument) {
  if (!currency || typeof amount !== 'number' || isNaN(amount)) return '—';

  if (instrument?.type === 'future') {
    return (
      new Intl.NumberFormat('ru-RU', {
        style: 'decimal'
      }).format(amount) + ' пт.'
    );
  }

  if (KNOWN_CURRENCIES.indexOf(instrument?.currency) === -1) {
    return (
      new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0
      }).format(amount) + ` ${instrument?.currency ?? currency}`
    );
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    minimumFractionDigits: 0,
    currency
  }).format(amount);
}

export function formatAbsoluteChange(price, instrument) {
  if (!instrument || typeof price !== 'number' || isNaN(price)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(price);
}

export function formatRelativeChange(change) {
  if (typeof change !== 'number' || isNaN(change)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(change);
}

export function formatPercentage(change) {
  if (typeof change !== 'number' || isNaN(change)) return '—';

  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    maximumFractionDigits: 3
  }).format(change);
}

export function formatQuantity(quantity, instrument) {
  if (typeof quantity !== 'number' || isNaN(quantity)) return '—';

  let precision = 0;

  if (typeof instrument?.minQuantityIncrement === 'number') {
    const [_, frac] = instrument.minQuantityIncrement.toString().split('.');

    precision = frac.length;
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(quantity);
}

export function cyrillicToLatin(text) {
  if (/^\p{Script=Cyrillic}+$/u.test(text)) {
    const EN = 'QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>~';
    const RU = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁ';
    const map = {};

    for (let i = 0; i < RU.length; i++) {
      map[RU[i]] = EN[i];
    }

    return text
      .split('')
      .map((l) => map[l.toUpperCase()])
      .join('');
  } else {
    return text;
  }
}

export function latinToCyrillic(text) {
  if (/[a-z]+/i.test(text)) {
    const EN = 'QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>~,.`\'[];';
    const RU = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁБЮЁЭХЪЖ';
    const map = {};

    for (let i = 0; i < RU.length; i++) {
      map[EN[i]] = RU[i];
    }

    return text
      .split('')
      .map((l) => map[l.toUpperCase()])
      .join('');
  } else {
    return text;
  }
}

export function priceCurrencySymbol(instrument) {
  if (instrument?.type === 'future' || instrument?.type === 'index')
    return 'пт.';

  if (instrument?.type === 'cryptocurrency') return instrument.quoteCryptoAsset;

  if (instrument?.currency === 'USDT') return 'USDT';

  if (instrument?.currency && instrument.currency !== 'N/A') {
    return (0)
      .toLocaleString('ru-RU', {
        style: 'currency',
        currency: instrument.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      .replace(/\d/g, '')
      .trim();
  } else return '';
}

export function currencyName(currencyCode) {
  if (KNOWN_CURRENCIES.indexOf(currencyCode) === -1) {
    return currencyCode;
  }

  if (!currencyCode) return '—';

  const currencyNames = new Intl.DisplayNames(['ru-RU'], { type: 'currency' });

  return currencyNames.of(currencyCode);
}

export function isDST() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch =
    firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember =
    firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);

  return (
    currentDate.getTime() <= end.getTime() &&
    currentDate.getTime() >= start.getTime()
  );
}

export function getUSMarketSession() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'afterhours';
  }

  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalMinutes = utcHours * 60 + utcMinutes;
  const isSummer = isDST();

  const premarketStart = isSummer ? 8 * 60 : 9 * 60;
  const premarketEnd = isSummer ? 13 * 60 + 30 : 14 * 60 + 30;
  const regularEnd = isSummer ? 20 * 60 : 21 * 60;

  if (totalMinutes >= premarketStart && totalMinutes < premarketEnd) {
    return 'premarket';
  } else if (totalMinutes >= premarketEnd && totalMinutes < regularEnd) {
    return 'regular';
  } else {
    return 'afterhours';
  }
}

export function formatFileSize(
  bytes,
  { si = true, dp = 1, useIntl = false } = {}
) {
  if (useIntl) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'unit',
      unit: 'byte',
      notation: 'compact',
      unitDisplay: 'narrow'
    }).format(bytes);
  }

  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
}

export function parseDistance(string = '') {
  let unit = '';

  string = string.trim();

  if (string.endsWith('%')) {
    unit = '%';
  } else if (string.endsWith('+')) {
    unit = '+';
  }

  string = string
    .replace(',', '.')
    .replace(/\s/g, '')
    .replace(/[^\x20-\x7E]/g, '');

  let value = parseFloat(string);

  if (unit === '+') {
    value = Math.trunc(value);
  }

  if (isNaN(value)) {
    return {};
  }

  return { value, unit };
}

export function distanceToString({ value, unit } = {}) {
  if (typeof value === 'undefined') {
    return '';
  }

  if (unit === '%') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      maximumFractionDigits: 2
    }).format(value / 100);
  } else if (unit === '+') {
    return `${Math.trunc(value)} +`;
  } else {
    return new Intl.NumberFormat('ru-RU', {
      style: 'decimal'
    }).format(value);
  }
}
