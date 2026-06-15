const fs = require('fs');
const p = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/misc.ts';
let c = fs.readFileSync(p, 'utf8');

const newTranslations = `  "Hide password": "إخفاء كلمة المرور",
  "Show password": "عرض كلمة المرور",
};`;

c = c.replace(/};\s*export default misc;/, newTranslations + '\n\nexport default misc;');

fs.writeFileSync(p, c, 'utf8');
