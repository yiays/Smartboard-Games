# Data sources for flash cards

## Kanji

I obtained the kanji data from https://github.com/davidluzgouveia/kanji-data.

Run this code on the contents of the file:

```js
Object.entries(kanji).sort((a, b) => a.freq - b.freq).slice(0, 1000).map(([k, v]) => ({[k]: v.meanings.join(', ')}))
```

## German

https://www.ocr.org.uk/images/68532-vocabulary-list-by-topic.pdf

