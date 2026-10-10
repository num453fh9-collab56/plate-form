/* ==========================================================================
   HIRELYX · COUNTRIES, DIAL CODES & SPOKEN LANGUAGES
   --------------------------------------------------------------------------
   Reference data for the onboarding contact fields. Profiles keep storing
   plain text (country = "City, Country", phone = "+92 3001234567",
   languages = "English (Fluent), Urdu (Native)") so the database schema and
   every existing reader stay untouched — these helpers only parse and format.
   ========================================================================== */

export interface Country {
  /** ISO 3166-1 alpha-2, upper case. */
  code: string;
  name: string;
  /** Dial code without the leading "+". */
  dial: string;
}

/* code|name|dial — kept compact on purpose. */
const RAW =
  "AF|Afghanistan|93;AL|Albania|355;DZ|Algeria|213;AD|Andorra|376;AO|Angola|244;AR|Argentina|54;AM|Armenia|374;" +
  "AU|Australia|61;AT|Austria|43;AZ|Azerbaijan|994;BS|Bahamas|1;BH|Bahrain|973;BD|Bangladesh|880;BB|Barbados|1;" +
  "BY|Belarus|375;BE|Belgium|32;BZ|Belize|501;BJ|Benin|229;BT|Bhutan|975;BO|Bolivia|591;BA|Bosnia and Herzegovina|387;" +
  "BW|Botswana|267;BR|Brazil|55;BN|Brunei|673;BG|Bulgaria|359;BF|Burkina Faso|226;BI|Burundi|257;KH|Cambodia|855;" +
  "CM|Cameroon|237;CA|Canada|1;CV|Cape Verde|238;CF|Central African Republic|236;TD|Chad|235;CL|Chile|56;CN|China|86;" +
  "CO|Colombia|57;KM|Comoros|269;CG|Congo|242;CD|Congo (DRC)|243;CR|Costa Rica|506;CI|Côte d'Ivoire|225;HR|Croatia|385;" +
  "CU|Cuba|53;CY|Cyprus|357;CZ|Czechia|420;DK|Denmark|45;DJ|Djibouti|253;DM|Dominica|1;DO|Dominican Republic|1;" +
  "EC|Ecuador|593;EG|Egypt|20;SV|El Salvador|503;GQ|Equatorial Guinea|240;ER|Eritrea|291;EE|Estonia|372;SZ|Eswatini|268;" +
  "ET|Ethiopia|251;FJ|Fiji|679;FI|Finland|358;FR|France|33;GA|Gabon|241;GM|Gambia|220;GE|Georgia|995;DE|Germany|49;" +
  "GH|Ghana|233;GR|Greece|30;GD|Grenada|1;GT|Guatemala|502;GN|Guinea|224;GW|Guinea-Bissau|245;GY|Guyana|592;HT|Haiti|509;" +
  "HN|Honduras|504;HK|Hong Kong|852;HU|Hungary|36;IS|Iceland|354;IN|India|91;ID|Indonesia|62;IR|Iran|98;IQ|Iraq|964;" +
  "IE|Ireland|353;IL|Israel|972;IT|Italy|39;JM|Jamaica|1;JP|Japan|81;JO|Jordan|962;KZ|Kazakhstan|7;KE|Kenya|254;" +
  "KI|Kiribati|686;XK|Kosovo|383;KW|Kuwait|965;KG|Kyrgyzstan|996;LA|Laos|856;LV|Latvia|371;LB|Lebanon|961;LS|Lesotho|266;" +
  "LR|Liberia|231;LY|Libya|218;LI|Liechtenstein|423;LT|Lithuania|370;LU|Luxembourg|352;MO|Macau|853;MG|Madagascar|261;" +
  "MW|Malawi|265;MY|Malaysia|60;MV|Maldives|960;ML|Mali|223;MT|Malta|356;MH|Marshall Islands|692;MR|Mauritania|222;" +
  "MU|Mauritius|230;MX|Mexico|52;FM|Micronesia|691;MD|Moldova|373;MC|Monaco|377;MN|Mongolia|976;ME|Montenegro|382;" +
  "MA|Morocco|212;MZ|Mozambique|258;MM|Myanmar|95;NA|Namibia|264;NR|Nauru|674;NP|Nepal|977;NL|Netherlands|31;" +
  "NZ|New Zealand|64;NI|Nicaragua|505;NE|Niger|227;NG|Nigeria|234;KP|North Korea|850;MK|North Macedonia|389;NO|Norway|47;" +
  "OM|Oman|968;PK|Pakistan|92;PW|Palau|680;PS|Palestine|970;PA|Panama|507;PG|Papua New Guinea|675;PY|Paraguay|595;" +
  "PE|Peru|51;PH|Philippines|63;PL|Poland|48;PT|Portugal|351;PR|Puerto Rico|1;QA|Qatar|974;RO|Romania|40;RU|Russia|7;" +
  "RW|Rwanda|250;KN|Saint Kitts and Nevis|1;LC|Saint Lucia|1;VC|Saint Vincent and the Grenadines|1;WS|Samoa|685;" +
  "SM|San Marino|378;ST|São Tomé and Príncipe|239;SA|Saudi Arabia|966;SN|Senegal|221;RS|Serbia|381;SC|Seychelles|248;" +
  "SL|Sierra Leone|232;SG|Singapore|65;SK|Slovakia|421;SI|Slovenia|386;SB|Solomon Islands|677;SO|Somalia|252;" +
  "ZA|South Africa|27;KR|South Korea|82;SS|South Sudan|211;ES|Spain|34;LK|Sri Lanka|94;SD|Sudan|249;SR|Suriname|597;" +
  "SE|Sweden|46;CH|Switzerland|41;SY|Syria|963;TW|Taiwan|886;TJ|Tajikistan|992;TZ|Tanzania|255;TH|Thailand|66;" +
  "TL|Timor-Leste|670;TG|Togo|228;TO|Tonga|676;TT|Trinidad and Tobago|1;TN|Tunisia|216;TR|Turkey|90;TM|Turkmenistan|993;" +
  "TV|Tuvalu|688;UG|Uganda|256;UA|Ukraine|380;AE|United Arab Emirates|971;GB|United Kingdom|44;US|United States|1;" +
  "UY|Uruguay|598;UZ|Uzbekistan|998;VU|Vanuatu|678;VA|Vatican City|39;VE|Venezuela|58;VN|Vietnam|84;YE|Yemen|967;" +
  "ZM|Zambia|260;ZW|Zimbabwe|263";

export const COUNTRIES: Country[] = RAW.split(";").map((row) => {
  const [code, name, dial] = row.split("|");
  return { code, name, dial };
});

/** Countries surfaced first in the picker — the platform's largest markets. */
export const POPULAR_COUNTRY_CODES = ["PK", "IN", "US", "GB", "AE", "SA", "CA", "AU", "BD", "DE"];

const ALIASES: Record<string, string> = {
  usa: "US",
  "united states of america": "US",
  america: "US",
  uk: "GB",
  england: "GB",
  britain: "GB",
  "great britain": "GB",
  uae: "AE",
  ksa: "SA",
  dubai: "AE",
  "south korea": "KR",
  korea: "KR",
  turkiye: "TR",
  "türkiye": "TR",
};

export function findCountry(query: string): Country | undefined {
  const needle = query.trim().toLowerCase();
  if (!needle) return undefined;
  const alias = ALIASES[needle];
  if (alias) return COUNTRIES.find((country) => country.code === alias);
  return COUNTRIES.find(
    (country) => country.name.toLowerCase() === needle || country.code.toLowerCase() === needle,
  );
}

/** Flag image (flagcdn) — emoji flags do not render on Windows. */
export function flagUrl(code: string, width: 20 | 40 | 80 = 40): string {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}

/* ------------------------------ location ------------------------------ */

export interface LocationParts {
  city: string;
  country: Country | undefined;
  /** Raw text when the stored value does not end in a known country. */
  raw: string;
}

/** "Lahore, Pakistan" → { city: "Lahore", country: PK }. */
export function parseLocation(value: string): LocationParts {
  const text = value.trim();
  if (!text) return { city: "", country: undefined, raw: "" };
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  const country = findCountry(parts[parts.length - 1] ?? "");
  if (country) {
    return { city: parts.slice(0, -1).join(", "), country, raw: "" };
  }
  return { city: "", country: undefined, raw: text };
}

export function formatLocation(city: string, country: Country | undefined): string {
  const cleanCity = city.trim();
  if (!country) return cleanCity;
  return cleanCity ? `${cleanCity}, ${country.name}` : country.name;
}

/* ------------------------------ phone ------------------------------ */

export interface PhoneParts {
  dial: string;
  number: string;
}

/** "+92 300 1234567" → { dial: "92", number: "300 1234567" }. Longest code wins. */
export function parsePhone(value: string, fallbackDial = ""): PhoneParts {
  const text = value.trim();
  if (!text.startsWith("+")) return { dial: fallbackDial, number: text };
  const digits = text.slice(1).replace(/\D/g, "");
  const dials = [...new Set(COUNTRIES.map((country) => country.dial))].sort(
    (a, b) => b.length - a.length,
  );
  const dial = dials.find((code) => digits.startsWith(code));
  if (!dial) return { dial: fallbackDial, number: text };
  /* Drop "+<dial>" and any separator that followed it, keep the rest as typed. */
  let rest = text.slice(1);
  let consumed = 0;
  let index = 0;
  while (index < rest.length && consumed < dial.length) {
    if (/\d/.test(rest[index])) consumed += 1;
    index += 1;
  }
  rest = rest.slice(index).replace(/^[\s\-().]+/, "");
  return { dial, number: rest };
}

export function formatPhone(dial: string, number: string): string {
  const cleanNumber = number.trim().replace(/^0+(?=\d)/, "");
  if (!cleanNumber) return "";
  return dial ? `+${dial} ${cleanNumber}` : cleanNumber;
}

/* ------------------------------ languages ------------------------------ */

export const LANGUAGE_LEVELS = ["Basic", "Conversational", "Fluent", "Native"] as const;
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export interface SpokenLanguage {
  name: string;
  level: LanguageLevel;
}

export const COMMON_LANGUAGES = [
  "English", "Urdu", "Hindi", "Punjabi", "Arabic", "Spanish", "French", "German",
  "Portuguese", "Italian", "Dutch", "Russian", "Turkish", "Persian", "Pashto", "Sindhi",
  "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Chinese", "Japanese", "Korean",
  "Indonesian", "Malay", "Thai", "Vietnamese", "Filipino", "Swahili", "Polish",
  "Ukrainian", "Greek", "Hebrew", "Swedish", "Norwegian", "Danish", "Finnish", "Romanian",
];

function isLevel(value: string): value is LanguageLevel {
  return (LANGUAGE_LEVELS as readonly string[]).includes(value);
}

/** "English (Fluent), Urdu" → [{English, Fluent}, {Urdu, Conversational}]. */
export function parseLanguages(value: string): SpokenLanguage[] {
  const seen = new Set<string>();
  const result: SpokenLanguage[] = [];
  for (const chunk of value.split(/[,;]/)) {
    const text = chunk.trim();
    if (!text) continue;
    const match = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(text);
    const name = (match ? match[1] : text).trim();
    const levelText = match ? match[2].trim() : "";
    const level = isLevel(levelText) ? levelText : "Conversational";
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push({ name, level });
  }
  return result;
}

export function formatLanguages(languages: SpokenLanguage[]): string {
  return languages.map((item) => `${item.name} (${item.level})`).join(", ");
}
