# EPUB Exporter

A small Chrome Manifest V3 extension for validating and saving a copy of an EPUB you already have.

## Safe, supported workflow

1. Use the bookstore's official download or export feature to obtain an EPUB file.
2. Open the extension, select that local `.epub` file, and wait for validation.
3. Save a checked copy from the extension.

The extension checks the ZIP/EPUB package structure and rejects files containing `META-INF/encryption.xml`. This is a conservative format check, not a guarantee of ownership or legal status; only use files you are authorized to export and keep. It does not access bookstore accounts, private reader APIs, protected content, or DRM keys, and it does not decrypt or remove DRM.

Readmoo reader-page extraction is **not supported**. The former implementation called a private reader API and has been removed. If Readmoo or another provider offers a documented official DRM-free EPUB export, use that provider flow first and then validate the resulting local file with this extension. The extension does not automate provider-specific exports.

## Build and install

```bash
yarn install
yarn build-prod
```

In Chrome, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the generated `dist/` folder.

The extension uses Manifest V3 and requests no host, browsing, storage, or download permissions. The selected file remains local to the popup; saving a copy uses the browser's normal download action.

## Development

```bash
yarn test --runInBand
yarn build
```

## License

MIT (see `package.json`).
