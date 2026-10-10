const fs = require('fs');
const content = fs.readFileSync('src/app/(provider)/provider/page.tsx', 'utf-8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('<h3 className="text-xl font-semibold">Assigned Vehicles</h3>')) - 1; // get the <div className="space-y-6">
const endIndex = lines.findIndex((l, i) => i > startIndex && l.trim() === '</div>' && lines[i+1].trim() === '</div>' && lines[i+2].trim() === ');');

// Wait, the end of the file is:
//     </div>
//   );
// }
//
// Let's just find the exact slice.
const before = lines.slice(0, startIndex);
const after = lines.slice(-3); //     </div>\n  );\n}

const newContent = [...before, ...after].join('\n');
fs.writeFileSync('src/app/(provider)/provider/page.tsx', newContent);
console.log('File updated successfully!');
