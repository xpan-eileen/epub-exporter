import JSZip from 'jszip';
import validateEpub from '@src/utils/epubValidator';

interface EpubOptions {
  mimetype?: string;
  container?: string;
  packageDocument?: string;
  encrypted?: boolean;
}

const createEpub = async (options: EpubOptions = {}): Promise<Uint8Array> => {
  const zip = new JSZip();
  zip.file('mimetype', options.mimetype || 'application/epub+zip');
  zip.file(
    'META-INF/container.xml',
    options.container || '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>',
  );

  if (options.encrypted) {
    zip.file('META-INF/encryption.xml', '<encryption/>');
  }

  zip.file('OEBPS/content.opf', options.packageDocument || '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf"/>');

  return zip.generateAsync({ type: 'uint8array' });
};

describe('validateEpub', () => {
  it('accepts a valid, unencrypted EPUB package', async () => {
    await expect(validateEpub(await createEpub())).resolves.toBeUndefined();
  });

  it('rejects archives that are not EPUBs', async () => {
    await expect(validateEpub(await createEpub({ mimetype: 'application/zip' })))
      .rejects.toThrow('does not contain the EPUB mimetype');
  });

  it('rejects EPUBs with encryption metadata', async () => {
    await expect(validateEpub(await createEpub({ encrypted: true })))
      .rejects.toThrow('Encrypted EPUBs are not supported');
  });

  it('rejects missing package documents', async () => {
    await expect(validateEpub(await createEpub({
      container: '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="missing.opf"/></rootfiles></container>',
    }))).rejects.toThrow('package document is missing');
  });

  it('rejects package paths that escape the EPUB archive directory', async () => {
    await expect(validateEpub(await createEpub({
      container: '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="../outside.opf"/></rootfiles></container>',
    }))).rejects.toThrow('package path is invalid');
  });

  it('rejects invalid package XML', async () => {
    await expect(validateEpub(await createEpub({ packageDocument: '<package>' })))
      .rejects.toThrow('invalid package XML');
  });

  it('rejects unreadable ZIP files', async () => {
    await expect(validateEpub(new Uint8Array([1, 2, 3]))).rejects.toThrow('readable EPUB ZIP archive');
  });
});
