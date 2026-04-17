# Headphone Battery Level — Stream Deck Plugin

A Stream Deck plugin that displays the current battery level of connected Bluetooth headphones.

## Requirements

- [Stream Deck](https://www.elgato.com/us/en/s/downloads) 7.1+
- [Node.js](https://nodejs.org/) 24+
- [Elgato Stream Deck CLI](https://github.com/elgatosf/cli): `npm install -g @elgato/cli`

## Development

```bash
npm install
npm run build
streamdeck link
```

### Watch mode

```bash
npm run watch
```

### Validate plugin

```bash
streamdeck validate
```

### Pack for distribution

```bash
streamdeck pack
```

## Built With

- [@elgato/streamdeck](https://github.com/elgatosf/streamdeck) SDK
- TypeScript
- Rollup
