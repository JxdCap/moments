import fs from 'fs';

function transformFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');

  // Background colors
  content = content.replace(/background: #ffffff;/g, 'background: #fdfdfd;');
  content = content.replace(/background: #f5f6f8;/g, 'background: transparent;');
  content = content.replace(/background: #f2f3f5;/g, 'background: #fafafa;');
  content = content.replace(/background: #111418;/g, 'background: transparent;');
  content = content.replace(/background: #2a2d32;/g, 'background: #fdfdfd;');

  // Text Colors
  content = content.replace(/color: #111418;/g, 'color: #333333;');
  content = content.replace(/color: #ffffff;/g, 'color: #333333;'); // active items, buttons etc.
  content = content.replace(/color: #222222;/g, 'color: #333333;');
  content = content.replace(/color: #1f2329;/g, 'color: #333333;');
  content = content.replace(/color: #8a93a3;/g, 'color: #888888;');
  content = content.replace(/color: #5f6878;/g, 'color: #888888;');
  content = content.replace(/color: inherit;/g, 'color: #333333;');

  // Font weights
  content = content.replace(/font-weight: 800;/g, 'font-weight: 500;');
  content = content.replace(/font-weight: 700;/g, 'font-weight: 500;');
  content = content.replace(/font-weight: 600;/g, 'font-weight: 500;');

  // Border radius
  content = content.replace(/border-radius: 999px;/g, 'border-radius: 2px;');
  content = content.replace(/border-radius: 50%;/g, 'border-radius: 2px;');
  content = content.replace(/border-radius: 1[0-9]px;/g, 'border-radius: 2px;');
  content = content.replace(/border-radius: [3-9]px;/g, 'border-radius: 2px;');
  content = content.replace(/border-radius: 24px 24px 0 0;/g, 'border-radius: 0;');

  // Shadows
  content = content.replace(/box-shadow:.*?;\n/g, '');
  
  // Blur
  content = content.replace(/backdrop-filter:.*?;\n/g, '');
  content = content.replace(/-webkit-backdrop-filter:.*?;\n/g, '');

  // Borders
  content = content.replace(/border-bottom: 1px solid rgb\(0 0 0 \/ 4%\);/g, 'border-bottom: 1px solid var(--hairline);');
  content = content.replace(/border-top: 1px solid rgb\(0 0 0 \/ 4%\);/g, 'border-top: 1px solid var(--hairline);');
  content = content.replace(/border: 1px solid rgba\(0, 0, 0, 0.04\);/g, 'border: 1px solid var(--hairline);');
  content = content.replace(/border: 1px solid #e1e4ea;/g, 'border: 1px solid var(--hairline);');
  content = content.replace(/border-color: #cad0dc;/g, 'border-color: #aaaaaa;');

  fs.writeFileSync(filePath, content);
}

transformFile('src/app/App.module.css');
transformFile('src/components/MomentCard.module.css');
transformFile('src/components/EditPostDialog.module.css');
transformFile('src/components/Lightbox.module.css');
