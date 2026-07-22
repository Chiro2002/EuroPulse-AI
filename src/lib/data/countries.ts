import { Country } from "../types";

export const euCountries: Country[] = [
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "Western Europe", population: 83200000, gdp: 3860 },
  { code: "FR", name: "France", flag: "🇫🇷", region: "Western Europe", population: 67800000, gdp: 2780 },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "Southern Europe", population: 58900000, gdp: 2010 },
  { code: "ES", name: "Spain", flag: "🇪🇸", region: "Southern Europe", population: 47600000, gdp: 1400 },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "Western Europe", population: 17600000, gdp: 1010 },
  { code: "BE", name: "Belgium", flag: "🇧🇪", region: "Western Europe", population: 11600000, gdp: 580 },
  { code: "PL", name: "Poland", flag: "🇵🇱", region: "Eastern Europe", population: 38000000, gdp: 690 },
  { code: "AT", name: "Austria", flag: "🇦🇹", region: "Central Europe", population: 9100000, gdp: 480 },
  { code: "PT", name: "Portugal", flag: "🇵🇹", region: "Southern Europe", population: 10300000, gdp: 250 },
  { code: "IE", name: "Ireland", flag: "🇮🇪", region: "Western Europe", population: 5100000, gdp: 500 },
];

export const countryNames: Record<string, string> = euCountries.reduce(
  (acc, c) => ({ ...acc, [c.code]: c.name }),
  {} as Record<string, string>
);
