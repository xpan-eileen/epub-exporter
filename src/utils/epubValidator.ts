import JSZip from 'jszip';

const parseXml = (source: string, label: string): Document => {
  const document = new DOMParser().parseFromString(source, 'application/xml');

  if (document.getElementsByTagName('parsererror').length > 0) {
    throw new Error(`The EPUB contains invalid ${label} XML.`);
  }

  return document;
};

const normalizePackagePath = (path: string): string => {
  const segments = path.split('/');

  if (!path || path.startsWith('/') || segments.some(segment => !segment || segment === '.' || segment === '..')) {
    throw new Error('The EPUB package path is invalid.');
  }

  return path;
};

const validateEpub = async (data: JSZip.InputFileFormat): Promise<void> => {
  let archive: JSZip;

  try {
    archive = await JSZip.loadAsync(data);
  } catch (error) {
    throw new Error('The selected file is not a readable EPUB ZIP archive.');
  }

  const mimetypeFile = archive.file('mimetype');
  if (!mimetypeFile || await mimetypeFile.async('string') !== 'application/epub+zip') {
    throw new Error('The selected archive does not contain the EPUB mimetype.');
  }

  if (archive.file('META-INF/encryption.xml')) {
    throw new Error('Encrypted EPUBs are not supported; the file contains META-INF/encryption.xml.');
  }

  const containerFile = archive.file('META-INF/container.xml');
  if (!containerFile) {
    throw new Error('The EPUB is missing META-INF/container.xml.');
  }

  const container = parseXml(await containerFile.async('string'), 'container');
  if (
    container.documentElement.localName !== 'container'
    || container.documentElement.namespaceURI !== 'urn:oasis:names:tc:opendocument:xmlns:container'
  ) {
    throw new Error('The EPUB container document is invalid.');
  }

  const rootfile = container.getElementsByTagName('rootfile')[0];
  const packagePath = rootfile && rootfile.getAttribute('full-path');

  if (!packagePath) {
    throw new Error('The EPUB container does not identify a package document.');
  }

  const packageFile = archive.file(normalizePackagePath(packagePath));
  if (!packageFile) {
    throw new Error('The EPUB package document is missing.');
  }

  const packageDocument = parseXml(await packageFile.async('string'), 'package');
  if (
    packageDocument.documentElement.localName !== 'package'
    || packageDocument.documentElement.namespaceURI !== 'http://www.idpf.org/2007/opf'
  ) {
    throw new Error('The EPUB package document is invalid.');
  }
};

export default validateEpub;
