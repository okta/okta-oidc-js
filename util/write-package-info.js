const fs = require('fs');
const path = require('path');

const workingDirectory = process.argv[2];
const destinationFile = process.argv[3];
const packageJsonPath = path.join(process.cwd(), workingDirectory, 'package.json');
const configDest = path.join(process.cwd(), workingDirectory, destinationFile);
const packageJson = require(packageJsonPath);
const packageInfo = {
  name: packageJson.name,
  version: packageJson.version
};
const output = 'export default ' + JSON.stringify(packageInfo, null, 2) + ';';

console.log('Writing config to', configDest);

fs.writeFileSync(configDest, output);
