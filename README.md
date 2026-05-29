<p align="center">
  <picture>
    <source
      width="512px"
      media="(prefers-color-scheme: dark)"
      srcset="assets/wordmark/tacet-wordmark-dark.svg"
    >
    <img
      width="512px"
      src="assets/wordmark/tacet-wordmark-light.svg"
    >
  </picture>
  <br>
   <a href="https://discord.gg/Q8NEcegvz7">
       <picture>
           <source height="32px" media="(prefers-color-scheme: dark)" srcset="assets/badges/discord.png" />
           <img height="32px" src="assets/badges/discord.png" />
       </picture>
   </a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
   <a href="https://github.com/sakayorii">
       <picture>
           <source height="32px" media="(prefers-color-scheme: dark)" srcset="assets/badges/github-dark.png" />
           <img height="32px" src="assets/badges/github-light.png" />
       </picture>
   </a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
   </a>
</p>

# Tacet

**Discord, your rest.** Tacet is a client modification for Discord. Built by Sakayori Studio.

Tacet aims to be a lightweight and lightning-fast client modification for Discord Android, while being user-friendly and developer-first. It provides a powerful framework, allowing developers to make add-ons with ease. The sky is the limit!

## ❓ About

This repository releases Hermes Bytecode to be executed on official Discord Android clients. The bytecode is not standalone and is meant to be used with a compatible bootstrapper (see the [⬇️ Download](#️-download) section).

## 🎼 Lineage

Tacet is a fork of [Revenge](https://github.com/revenge-mod), which itself descends from [Bunny](https://github.com/pyoncord/Bunny) and [Vendetta](https://github.com/vendetta-mod). We are grateful to those projects and their contributors — Tacet would not exist without them. The Tacet branding is new, but the underlying framework's lineage and credit remain with Revenge, Bunny, and Vendetta.

## 💪 Features

- **🔌 Plugins**: Extend Discord with custom features
- **🎨 Themes & Fonts**: Customize Discord's appearance to your liking
- **🧪 Experiments**: Try out Discord's new features before they're rolled out

## ⬇️ Download

Tacet is distributed as a Hermes bytecode bundle that is loaded by a compatible bootstrapper. Install one of the loaders below, then point it at a hosted `tacet.bundle`:

- **📵 Non-root**: [Tacet Manager](https://github.com/sakayorii/tacet-manager/releases/latest)
- **🩹 Root with Xposed**: [Tacet Xposed](https://github.com/sakayorii/tacet-xposed/releases/latest)

### ⬆️ Loading Tacet

> **It is recommended to do a separate installation before loading Tacet, as it does not offer an easy way to revert.**

1. Download the latest `tacet.bundle` artifact from the repository's [Actions tab](https://github.com/sakayorii/tacet-bundle-next/actions/workflows/build.yml).
2. Extract the built bundle and host a local HTTP server that serves the `tacet.bundle` file.
3. In your loader, enable **Developer Settings**.
4. Head into the **Developer** section.
5. Edit the **Load from custom URL** field to point to the URL of the `tacet.bundle` file you hosted.
6. Restart Discord, and you should be running Tacet!

### 🔄️ Updating builds

To update to the latest build, follow these steps:

1. Host a HTTP server that points to a new `tacet.bundle` file.
2. Head to **Settings** > **Developer** (under the **Tacet** section).
3. Tap on the **Evaluate JavaScript** option.
4. Paste and evaluate the following snippet. Make sure to modify the URL to point to your newly hosted `tacet.bundle` file:

    ```js
    var TACET_UPDATE_URL = "<URL here, keep the quotes>";
    tacet.discord.native.FileModule.writeFile("documents", "pyoncord/loader.json", JSON.stringify({"customLoadUrl":{"enabled":true,"url":TACET_UPDATE_URL}}), "utf8");
    "URL updated, please reload Tacet"
    ```

5. Restart Discord.

> **Note:** `pyoncord/loader.json` and the `customLoadUrl` keys are part of the bootstrapper's loader contract and must be kept as-is.

## 👷 Developing with Tacet

You'll need to have [Bun](https://bun.com/) installed. Once you have Bun, follow these steps:

```sh
# Install dependencies
bun install
```

---

```sh
# Build Tacet
bun run build

# Build Tacet with debugging enabled (slow, don't use in production)
bun run build --dev
```

```sh
# Start the development server
bun run dev

# Build as production
bun run dev --prod
```

<sub>Builds are generated at `dist/tacet.bundle`.</sub>

```sh
# Build types for external consumers
bun run types
```

<sub>Types are generated at `dist/types`. To consume, include `<dir>/globals.d.ts`, and map `@tacet-mod/*` to `<dir>/lib/*`.</sub>
<br>
<sub>Bundlers will need to map imports to property access on `tacet` turning `kebab-case` and `snake_case` to `camelCase`.</sub>
<sub>Example: `@tacet-mod/discord/modules/main_tabs_v2` to `tacet.discord.modules.mainTabsV2`</sub>

## 🙌 Credits

- **Studio**: Sakayori Studio
- **Lead maintainer**: Sakayori
- **Lineage**: [Revenge](https://github.com/revenge-mod), [Bunny](https://github.com/pyoncord/Bunny), and [Vendetta](https://github.com/vendetta-mod)
- **Patcher**: [ryan-0324](https://github.com/ryan-0324)

## 📜 License

Tacet is licensed under the **GNU General Public License v3.0 or later**. See [LICENSE](./LICENSE) for the full text.

Copyright © Sakayori Studio and Tacet contributors.

As a fork, Tacet retains the rights and credits of the upstream Revenge, Bunny, and Vendetta projects under the same license. The lineage attribution above is intentional and must remain accurate.
