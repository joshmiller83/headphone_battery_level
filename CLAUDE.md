# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An Elgato Stream Deck plugin that shows Bluetooth headphone battery level on a Stream Deck key. Built with the official `@elgato/streamdeck` SDK in TypeScript.

## CLI Tool

The `streamdeck` CLI (`@elgato/cli`) manages the plugin lifecycle:

```bash
streamdeck link          # Link plugin to Stream Deck (run after build)
streamdeck restart <uuid> # Restart plugin in Stream Deck
streamdeck validate      # Validate plugin manifest and structure
streamdeck pack          # Bundle into .streamDeckPlugin for distribution
streamdeck dev           # Enable developer mode
```

## Build Commands

```bash
npm install
npm run build   # Compile TypeScript + Rollup bundle
npm run watch   # Watch mode with hot-reload
```

## Plugin Architecture

Plugins follow the `@elgato/streamdeck` SDK pattern:

- **`src/plugin.ts`** — Entry point; registers actions with `streamDeck.connect()`
- **`src/actions/`** — One file per action, each exports a class extending `SingletonAction`
- **`*.sdPlugin/manifest.json`** — Plugin metadata, UUIDs, Node.js version, icon paths
- **`*.sdPlugin/bin/`** — Compiled output (git-ignored)

Actions use the `@action({ UUID: "com.author.plugin.actionname" })` decorator and handle events via methods like `onKeyDown()`, `onWillAppear()`, `onDidReceiveSettings()`.

## Key Conventions

- Plugin UUID format: `com.joshmiller83.headphone-battery-level`
- Action UUIDs must be prefixed with the plugin UUID
- `manifest.json` is the source of truth for Stream Deck registration
- Debug mode is configured in `manifest.json` under `Nodejs.Debug`
