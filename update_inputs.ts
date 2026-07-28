import * as fs from 'fs';

const filePath = 'src/components/UserCabinet.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// replace standard inputs
content = content.replace(/className="w-full([^"]*)border border-slate-200 dark:border-slate-700([^"]*)"/g, 'className="w-full$1border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 $2"');
// Clean double bgs just in case
content = content.replace(/bg-white dark:bg-slate-900 bg-white dark:bg-slate-900/g, 'bg-white dark:bg-slate-900');
content = content.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Inputs updated.');
