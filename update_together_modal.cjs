const fs = require('fs');
const path = require('path');

const filePath = '/Users/yasser/Downloads/harbor-main newUpdate/src/components/together-modal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('useT')) {
  content = content.replace(/^import .*?;\n/, match => `import { useT } from "@/lib/i18n";\n${match}`);
}

content = content.replace(/export function TogetherPopover\(\{/, `export function TogetherPopover({`);
content = content.replace(/const \{ enabled, snapshot,/, `const t = useT();\n  const { enabled, snapshot,`);

const replacements = [
  { from: /"Invite via link"/g, to: `t("Invite via link")` },
  { from: /"Watch together"/g, to: `t("Watch together")` },
  { from: /"Back"/g, to: `t("Back")` },
  { from: /Invite\n *<\/button>/, to: `{t("Invite")}\n          </button>` },
  { from: /<p className="text-\[13px\] text-ink">Watch Together needs a relay\.<\/p>/, to: `<p className="text-[13px] text-ink">{t("Watch Together needs a relay.")}</p>` },
  { from: /A relay is a tiny Cloudflare Worker that passes play\/pause\/seek messages\n *between you and your friends\. No video data ever touches it\. Deploy your\n *own in one click \(free tier is plenty\), or paste a friend's invite link to\n *use theirs\./, to: `{t("A relay is a tiny Cloudflare Worker that passes play/pause/seek messages between you and your friends. No video data ever touches it. Deploy your own in one click (free tier is plenty), or paste a friend's invite link to use theirs.")}` },
  { from: /placeholder="Paste invite link"/, to: `placeholder={t("Paste invite link")}` },
  { from: />\n *Join\n *<\/button>/g, to: `>\n              {t("Join")}\n            </button>` },
  { from: />\n *Open Settings\n *<\/button>/, to: `>\n              {t("Open Settings")}\n            </button>` },
  { from: /Your name<\/span>/, to: `{t("Your name")}</span>` },
  { from: /\{connecting \? "Starting…" : "Start a new room"\}/, to: `{connecting ? t("Starting…") : t("Start a new room")}` },
  { from: /<span>or join<\/span>/, to: `<span>{t("or join")}</span>` },
  { from: /or paste an invite link\n *<\/p>/, to: `{t("or paste an invite link")}\n            </p>` },
  { from: />\n *Try again\n *<\/button>/, to: `>\n                {t("Try again")}\n              </button>` },
  { from: /Room code<\/span>/, to: `{t("Room code")}</span>` },
  { from: /\{participants\.length\} watching\n *<\/span>/, to: `{t("{n} watching").replace("{n}", participants.length.toString())}\n            </span>` },
  { from: /Show cursors\n *<\/span>/, to: `{t("Show cursors")}\n            </span>` },
  { from: /Leave room\n *<\/button>/, to: `{t("Leave room")}\n          </button>` },
];

for (const rep of replacements) {
  content = content.replace(rep.from, rep.to);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated together-modal.tsx");
