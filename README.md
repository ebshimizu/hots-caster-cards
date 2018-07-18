# hots-caster-cards

A script that exports ability and talent flashcards to [Anki2](https://apps.ankiweb.net/index.html)

## Usage
Requires: Node

```
> yarn install
> node cards.js
```

Outputs two files: `abilities.txt` and `talents.txt` which can be imported into Anki2.

## Options
`--no-download`: Skips the download of the heroes-talents repository if you already have it in the right place.

`--imagedir [path]`: Automatically copies the talent images to the specified [Anki Media folder](https://apps.ankiweb.net/docs/manual.html#files). It actually just dumps the images wherever this folder is, so be careful that you have the right directory before running with this option. If you don't use this option, you'll have to copy the images in the `heroes-talents/images/talents` folder manually.

## Third-Party Libraries
[heroes-talents](https://github.com/heroespatchnotes/heroes-talents)