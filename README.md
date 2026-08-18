<p align="center">
	<a href="https://type-archive.miftahulislamefaz.xyz">
		<img src="https://mvajwthjkbwfrzuyvuxl.supabase.co/storage/v1/object/public/Logo/cover.jpg" alt="Type Archive - free fonts for designers and developers, organised in your own space" width="100%">
	</a>
</p>

<h1 align="center">
	<img src="https://mvajwthjkbwfrzuyvuxl.supabase.co/storage/v1/object/public/Logo/Fonts_library_faviconlogo.png" alt="" width="28" align="center">
	Type Archive
</h1>

<p align="center">
	Free fonts for designers and developers, organised in your own space.<br>
	<a href="https://type-archive.miftahulislamefaz.xyz"><strong>type-archive.miftahulislamefaz.xyz</strong></a>
</p>

---

The fonts you fall in love with end up scattered across downloads, bookmarks and
half-remembered websites. Type Archive keeps them in one place: upload the files
or paste a stylesheet link, and each family gets a proper entry with a live
specimen you can type your own words into. Everything you add is saved to your
personal space and joins the public community library.

## Features

- **Files or links** - upload `.ttf`, `.otf`, `.woff`, `.woff2` or paste a foundry stylesheet URL
- **Automatic compression** - uploads are converted to WOFF2 by a Supabase Edge Function before storage
- **Live specimens** - server-rendered previews in regular, bold and italic, editable in place
- **Per-family controls** - size, leading, weight and slant on every row, plus a page-wide control bar
- **Category filtering** - typed categories are normalised to `Serif / Display` form and become filters
- **Pairing** - build a pairing from any two families, or use combinations scored automatically
- **Use anywhere** - download the files, copy an HTML embed or CSS, or install with one terminal command
- **Personal and public spaces** - your copies stay yours; duplicates never clutter the public library
- **Favourites** and **Google sign-in**
- **Crawlable by design** - server-rendered HTML, JSON-LD, `sitemap.xml`, `/fonts.txt`, `/llms.txt`

## Install a font from your terminal

```bash
curl -fsSL https://type-archive.miftahulislamefaz.xyz/api/fonts/<slug>/install | sh
```

Downloads every style into `./fonts/<slug>/` and writes a ready `@font-face`
stylesheet. Pass a folder with `| sh -s ./public/fonts`. On Windows:

```powershell
irm https://type-archive.miftahulislamefaz.xyz/api/fonts/<slug>/install?shell=powershell | iex
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Supabase
(Postgres, Storage, Auth, Edge Functions) · Vercel

## Developer

Built by **[Miftahul Islam Efaz](https://www.miftahulislamefaz.xyz/)** -
entrepreneur, vibe-coder and AI orchestrator from Dhaka, Bangladesh, working
under the brand **Webigns**. LabLab.ai Hackathon global winner and Impact Dhaka
Festival grand champion for AI workflows.

[Portfolio](https://www.miftahulislamefaz.xyz/) ·
[GitHub](https://github.com/Miftahul-Islam-Efaz) ·
[LinkedIn](https://www.linkedin.com/in/miftahul-islam-efaz-a91373284/) ·
[X](https://x.com/Miftahul_Islam9)

## License

The source code is released under the MIT License. Fonts added to the library
keep the licence of their original foundry - check each family at its source
before commercial use.
