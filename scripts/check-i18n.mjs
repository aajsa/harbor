import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const localesDir = resolve("src/lib/i18n/locales");
const languages = ["en", "ar", "pt"];
const catalogs = Object.fromEntries(
  await Promise.all(
    languages.map(async (language) => {
      const json = await readFile(resolve(localesDir, `${language}.json`), "utf8");
      return [language, JSON.parse(json)];
    }),
  ),
);

function placeholders(value) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((match) => match[1]).sort();
}

const errors = [];
for (const [language, catalog] of Object.entries(catalogs)) {
  if (!catalog || Array.isArray(catalog) || typeof catalog !== "object") {
    errors.push(`${language}.json must contain one object`);
    continue;
  }
  for (const [key, value] of Object.entries(catalog)) {
    if (typeof value !== "string") {
      errors.push(`${language}.json: ${JSON.stringify(key)} must map to a string`);
      continue;
    }
    if (language === "en") continue;
    if (!(key in catalogs.en)) {
      errors.push(`${language}.json: ${JSON.stringify(key)} is missing from en.json`);
      continue;
    }
    const expected = placeholders(catalogs.en[key]);
    const actual = placeholders(value);
    if (expected.join("\0") !== actual.join("\0")) {
      errors.push(
        `${language}.json: ${JSON.stringify(key)} placeholders [${actual}] do not match English [${expected}]`,
      );
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Valid catalogs: ${Object.keys(catalogs.en).length} English, ${Object.keys(catalogs.ar).length} Arabic, ${Object.keys(catalogs.pt).length} Portuguese strings.`,
  );
}
