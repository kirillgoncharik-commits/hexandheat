# Asset storage policy

Git stores manifests, prompts, rights evidence, thumbnails/proxies and checksums—not heavy masters. Production media is uploaded to versioned, access-controlled object storage under content-addressed keys such as `sha256/<digest>/<name>` and later copied to the Engine CDN as required.

Before any paid service or bucket is enabled, the Product Owner must approve provider, region, retention and monthly cap. Until then, masters remain in local encrypted working storage and are referenced by `ASSET_MANIFEST.json`; losing local files before approved storage exists is an accepted pilot risk.

Limits enforced by CI: 1 MiB default per repository file, 5 MiB only for explicitly allow-listed test fixtures. Git LFS is not the default because it hides storage/bandwidth cost and does not solve provenance or deployment. Google Drive is used only when an artifact needs a presentation-native format.
