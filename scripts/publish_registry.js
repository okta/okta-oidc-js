'use strict';

const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

const packagesDir = path.resolve(path.join(__dirname, '../packages'));
const overridePublishDir = {
  'okta-angular': './dist'
};

// collect local packages (assuming only dirs in packages)
let dirs = fs.readdirSync(packagesDir)
  .filter(name => name[0] !== '.'); // removes .DS_STORE

const registry = process.env.REGISTRY;

if (!registry) {
  throw 'A REGISTRY environment variable must be set';
}

console.log(`Using this registry: ${registry}`);

let hasPublishedAPackage = false;

dirs.forEach(name => {
  const moduleDir = `${packagesDir}/${name}`;
  const pkg = require(`${moduleDir}/package`);
  const moduleWithVersion = `${pkg.name}@${pkg.version}`;

  console.log(`Checking if ${moduleWithVersion} exists`);

  let isInPublicNpm = false;
  try {
    isInPublicNpm = !!execSync(`npm view ${moduleWithVersion} --registry ${registry}`).toString();
  } catch (err) {
    // We expect packages that do not exist to throw a 404 error
    console.log(`${pkg.name} does not have any published versions`);
  }

  if (isInPublicNpm) {
    console.log(`${moduleWithVersion} exists`);
  } else {
    console.log(`Publishing ${moduleWithVersion}`);
    const publishDir = overridePublishDir[name] || '.';
    execSync(`npm publish ${publishDir} --registry ${registry}`, {
      cwd: moduleDir
    });
    hasPublishedAPackage = true;
  }
});

if (hasPublishedAPackage) {
  execSync('git tag -f last-published && git push -f origin last-published');
}

console.log('Finished syncing latest packages to public npm');
