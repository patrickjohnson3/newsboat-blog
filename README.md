# Newsboat Blog (Hugo)

This is a vibe coded project.

A Newsboat-inspired blog template built with Hugo.

## Live Site

[patrickjohnson3.github.io/newsboat-blog](https://patrickjohnson3.github.io/newsboat-blog/)

## Requirements

- Hugo (extended recommended)

## Run Locally

```bash
hugo server
```

Default local URL:

```text
http://localhost:1313
```

## Build

```bash
hugo --minify
```

Generated site output goes to:

```text
public/
```

## Project Structure

- `content/posts/`: markdown posts
- `layouts/`: Hugo templates
- `layouts/partials/`: shared template partials
- `static/css/`: styles
- `static/js/`: frontend behavior
- `public/`: generated build artifacts

## Configuration

Main Hugo config:

- `config.toml`

Current site title in config:

- `Newsboat Blog`

## Deployment

This repo includes a GitHub Actions workflow at:

- `.github/workflows/hugo.yml`

It builds and deploys the site to GitHub Pages on pushes to `master`.
