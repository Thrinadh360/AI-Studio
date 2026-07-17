import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function zipFolder() {
  console.log('Starting JSZip packaging for cpanel-deploy...');
  const zip = new JSZip();
  const folderPath = path.resolve('cpanel-deploy');
  
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
  fs.writeFileSync('public/cpanel-simple-deployment.zip', content);
  console.log('Zip file successfully generated inside public/cpanel-simple-deployment.zip');
}

zipFolder().catch(err => {
  console.error('Failed to create zip:', err);
  process.exit(1);
});
