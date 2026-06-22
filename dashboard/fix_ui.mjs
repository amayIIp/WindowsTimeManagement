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

    // Replace card classes
    content = content.replace(/sharp-card/g, 'glass-card');
    content = content.replace(/glass-card-24/g, 'glass-card');
    content = content.replace(/glass-card-green/g, 'glass-card');

    // Remove chaotic modifiers
    content = content.replace(/fracture-[abc]/g, '');
    content = content.replace(/app-shell/g, '');
    content = content.replace(/data-bleed/g, '');
    content = content.replace(/lg:translate-x-5/g, '');
    content = content.replace(/lg:-translate-y-7/g, '');
    content = content.replace(/md:-translate-y-3/g, '');
    content = content.replace(/md:-translate-x-2/g, '');
    content = content.replace(/xl:translate-y-5/g, '');
    content = content.replace(/xl:-translate-x-5/g, '');

    // Replace title styles
    content = content.replace(/deco-title/g, 'text-4xl font-bold tracking-tight text-white');
    content = content.replace(/technical-line/g, 'text-xs text-slate-400 mt-2 font-mono');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', path.basename(file));
    }
});
