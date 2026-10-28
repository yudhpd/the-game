const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const IMAGES_MD_PATH = path.join(ROOT, "IMAGES_NEEDED.md");
const IMAGES_DIR = path.join(ROOT, "images");
const { CATEGORIES } = require(path.join(ROOT, "questions.js"));

function findExistingFile(slug, n) {
  const dir = path.join(IMAGES_DIR, slug);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const match = files.find((f) => {
    const m = f.match(/^(\d+)-/);
    return m && parseInt(m[1], 10) === n;
  });
  return match || null;
}

function baseNameFromImagePath(imagePath) {
  return imagePath.split("/").pop();
}

let mdOut = `# Images needed

The app shows an image as the only clue — no text question — then contestants
guess what it is from 4 options. Drop your own image **files** into the paths
below (create each category folder as you go).

Checked items below already have a file in place — thumbnails are inlined so
you can eyeball them here without opening the folder. This checklist itself
never contains image data; it just links to the real files sitting in
\`images/<category>/\`.

**Format:** any of \`.jpg\` \`.jpeg\` \`.png\` \`.webp\` \`.gif\` — just match the filename
before the extension. The app tries each extension in order and shows a
"still needed" placeholder in-app until a match is found, so you can add
these gradually and playtest as you go.

**Tip:** landscape or square images work best; they're displayed contained
(not cropped) inside a 260px-tall box.

`;

let totalDone = 0;
let totalQuestions = 0;

CATEGORIES.forEach((cat) => {
  mdOut += `## ${cat.name} (\`images/${cat.slug}/\`)\n`;
  cat.questions.forEach((q) => {
    totalQuestions++;
    const baseName = baseNameFromImagePath(q.image);
    const n = parseInt(baseName.match(/^(\d+)-/)[1], 10);
    const foundFile = findExistingFile(cat.slug, n);
    if (foundFile) {
      totalDone++;
      mdOut += `- [x] <img src="images/${cat.slug}/${foundFile}" width="80"> \`${baseName}\` — ${q.answer}\n`;
    } else {
      mdOut += `- [ ] \`${baseName}\` — ${q.answer}\n`;
    }
  });
  mdOut += "\n";
});

fs.writeFileSync(IMAGES_MD_PATH, mdOut.trimEnd() + "\n");
console.log(`Wrote IMAGES_NEEDED.md — ${totalDone}/${totalQuestions} images in place.`);
