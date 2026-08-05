# Security Policy

## Responsible Disclosure

If you discover a security vulnerability in Gia-co-Design, please report it responsibly.

Since this app runs entirely client-side with no backend server, the primary security concern is the safe handling of API keys.

### API Key Safety

- API keys are stored **only** in your browser's local storage.
- Keys are **never** transmitted to any server or logged anywhere.
- The app sends requests directly from your browser to the AI provider's API.

### Reporting Vulnerabilities

Please open a GitHub Security Advisory or contact the maintainers at [alpha-1-design](https://github.com/alpha-1-design).

### Supported Versions

The latest release receives security updates. Older versions are not guaranteed to receive patches.
