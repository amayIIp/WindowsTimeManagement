import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace all text color classes with text-white
    content = content.replace(/text-(slate|gray|zinc|neutral|stone)-\d00/g, 'text-white/80');
    // Replace hardcoded dark hex colors
    content = content.replace(/text-\[#[0-9a-fA-F]{6}\]/g, 'text-white/80');
    // Replace hover text colors
    content = content.replace(/hover:text-\[#[0-9a-fA-F]{6}\]/g, 'hover:text-white');
    content = content.replace(/hover:text-(slate|gray|zinc|neutral|stone)-\d00/g, 'hover:text-white');

    // Make text-white/80 into text-white where the user explicitly wanted ALL text white everywhere
    content = content.replace(/text-white\/80/g, 'text-white');

    // Remove duplicates like text-white text-white
    content = content.replace(/text-white text-white/g, 'text-white');
    content = content.replace(/text-white\s+text-white/g, 'text-white');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed text in', path.basename(file));
    }
});
