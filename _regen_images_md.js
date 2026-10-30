const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const IMAGES_MD_PATH = path.join(ROOT, "IMAGES_NEEDED.md");
const IMAGES_DIR = path.join(ROOT, "images");
const { CATEGORIES } = require(path.join(ROOT, "questions.js"));

// Same extensions, in the same order, that the app tries at runtime (see
// IMAGE_EXTENSIONS in app.js / misc.js) — so a file only counts as "in place"
// if the app would actually find it.
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

function findExistingFile(slug, baseName) {
  const dir = path.join(IMAGES_DIR, slug);
  if (!fs.existsSync(dir)) return null;
  const files = new Set(fs.readdirSync(dir));
  const ext = IMAGE_EXTENSIONS.find((e) => files.has(`${baseName}.${e}`));
  return ext ? `${baseName}.${ext}` : null;
}

function baseNameFromImagePath(imagePath) {
  return imagePath.split("/").pop();
}

let mdOut = `# Images needed

The app shows an image as the only clue — no text question, no multiple choice —
contestants call out their guess and the Game Master judges it. Drop your own image **files** into the paths
below (create each category folder as you go).

Checked items below already have a file in place — thumbnails are inlined so
you can eyeball them here without opening the folder. This checklist itself
never contains image data; it just links to the real files sitting in
\`images/<category>/\`.

**Format:** any of \`.jpg\` \`.jpeg\` \`.png\` \`.webp\` \`.gif\` \`.avif\` — just match the filename
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
    const foundFile = findExistingFile(cat.slug, baseName);
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
