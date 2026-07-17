import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function zipDistFolder() {
  console.log('Starting JSZip packaging for dist...');
  const zip = new JSZip();
  const folderPath = path.resolve('dist');
  
  if (!fs.existsSync(folderPath)) {
    console.error('Error: dist/ directory does not exist. Run npm run build first.');
    process.exit(1);
  }

  function addFilesRecursively(currentPath: string, zipFolderRef: JSZip) {
    const list = fs.readdirSync(currentPath);
    for (const file of list) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipFolderRef.folder(file);
        if (subFolder) {
          addFilesRecursively(fullPath, subFolder);
        }
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolderRef.file(file, content);
      }
    }
  }

  addFilesRecursively(folderPath, zip);
  
  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync('public/csync-public_html-dist.zip', content);
  console.log('Zip file successfully generated at public/csync-public_html-dist.zip!');

  // Also bundle the simple cPanel drop-in backend zip (api.php + .htaccess)
  console.log('Generating simple cPanel drop-in package...');
  const simpleZip = new JSZip();
  if (fs.existsSync('public/api.php')) {
    simpleZip.file('api.php', fs.readFileSync('public/api.php'));
  }
  if (fs.existsSync('public/.htaccess')) {
    simpleZip.file('.htaccess', fs.readFileSync('public/.htaccess'));
  }
  if (fs.existsSync('cpanel-deploy/README.md')) {
    simpleZip.file('README.md', fs.readFileSync('cpanel-deploy/README.md'));
  }
  const simpleContent = await simpleZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync('public/cpanel-simple-deployment.zip', simpleContent);
  console.log('Simple cPanel drop-in ZIP generated at public/cpanel-simple-deployment.zip!');
}

zipDistFolder().catch(err => {
  console.error('Failed to create dist zip:', err);
  process.exit(1);
});
