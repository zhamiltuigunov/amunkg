import * as fs from 'fs';

const filePath = 'src/components/UserCabinet.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { search: /bg-white(?=[\s'"/}])/g, replace: 'bg-white dark:bg-slate-900'},
  { search: /bg-slate-50\b(?! \/)/g, replace: 'bg-slate-50 dark:bg-slate-800'},
  { search: /border-slate-200(?=[\s'"/}])/g, replace: 'border-slate-200 dark:border-slate-700'},
  { search: /border-slate-300(?=[\s'"/}])/g, replace: 'border-slate-300 dark:border-slate-600'},
  { search: /text-slate-800(?=[\s'"/}])/g, replace: 'text-slate-800 dark:text-slate-200'},
  { search: /text-slate-700(?=[\s'"/}])/g, replace: 'text-slate-700 dark:text-slate-300'},
  { search: /text-slate-600(?=[\s'"/}])/g, replace: 'text-slate-600 dark:text-slate-400'},
  { search: /text-slate-900(?=[\s'"/}])/g, replace: 'text-slate-900 dark:text-slate-100'}
];

for (let r of replacements) {
    // Avoid double-replacing existing dark: classes
    // We can do a simple replacement, but if dark: is already there we might duplicate.
    // Assuming mostly they aren't. We'll clean up any "dark:bg-slate-900 dark:bg-slate-900" later if needed.
    content = content.replace(r.search, r.replace);
}

// Clean up possible duplicates like `text-slate-900 dark:text-slate-100 dark:text-slate-100`
content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
content = content.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
content = content.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
