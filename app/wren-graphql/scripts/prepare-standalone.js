const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  throw new Error('Missing .next/standalone. Run yarn build before yarn start.');
}

const copyIfExists = (source, destination) => {
  if (!fs.existsSync(source)) return;
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
};

copyIfExists(
  path.join(root, '.next', 'static'),
  path.join(standaloneDir, '.next', 'static'),
);
copyIfExists(path.join(root, 'public'), path.join(standaloneDir, 'public'));
