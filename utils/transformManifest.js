const path = require('path');

const { appPath } = require('./paths');
const { npmPackage } = require('./env');

const parseJsonFromBuffer = (buffer, filePath) => {
  try {
    return JSON.parse(buffer.toString());
  } catch (e) {
    const relativeFilePath = path.relative(appPath, filePath);
    e.message = `${e.message} in ${relativeFilePath}`;

    throw e;
  }
};

const transformManifest = (buffer, filePath) => {
  const manifest = parseJsonFromBuffer(buffer, filePath);
  // change dash to space and uppercase first letter
  const name = npmPackage.name.replace('-', ' ').replace(/^\w/, c => c.toUpperCase());
  const { description, author, version } = npmPackage;
  const newManifest = {
    ...manifest,
    name,
    version,
    description,
    author,
  };

  return JSON.stringify(newManifest, null, 2);
};

module.exports = transformManifest;
