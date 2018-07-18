const download = require('download-git-repo');
const fs = require('fs-extra');
const path = require('path');
const heroesTalentsRepo = 'github:heroespatchnotes/heroes-talents';
const localDir = process.cwd();
const heroesTalentsDir = path.join(localDir, 'heroes-talents');
const abilityFile = path.join(localDir, 'abilities.txt');
const talentFile = path.join(localDir, 'talents.txt')
const argv = require('yargs-parser')(process.argv.slice(2));

// the anki media folder looks like C:\Users\falindrith\AppData\Roaming\Anki2\User 1\collection.media. Needs to be a command line arg
const ankiMediaFolder = argv.imagedir;

// download the heroes-talents repo to local
if (!(argv.download === false)) {
  console.log(`Downloading ${heroesTalentsRepo} to ${heroesTalentsDir}`);
  download(heroesTalentsRepo, heroesTalentsDir, function(err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("Download complete. Performing export...");
      exportHeroCards();
    }
  });
}
else {
  console.log('Skipping heroes-talents download');
  exportHeroCards();
}

function exportHeroCards() {
  // for each hero, append to a specified text file
  const abilityCardFile = fs.createWriteStream(abilityFile, {
    autoClose: false,
    flags: 'w'
  });

  const talentCardFile = fs.createWriteStream(talentFile, {
    autoClose: false,
    flags: 'w'
  });

  // create hero data array, start processing
  const heroFiles = fs.readdirSync(path.join(localDir, 'heroes-talents', 'hero'));
  console.log(`Found ${heroFiles.length} files.`);

  processHeroAbilities(heroFiles[0], heroFiles.slice(1), abilityCardFile, () => {
    console.log(`Processing hero talents`);
    processHeroTalents(heroFiles[0], heroFiles.slice(1), talentCardFile, () => {
      console.log('Export Complete!');

      if (ankiMediaFolder) {
        exportImagesTo(ankiMediaFolder);
      }
    })
  });
}

// processes a json file, appends lines to the outFile
function processHeroAbilities(dataFile, remaining, outFile, complete) {
  // base case
  if (!dataFile) {
    console.log('Ability Processing Complete');
    complete();
    return;
  }

  console.log(`Processing Abilities for ${dataFile}`);
  heroData = JSON.parse(fs.readFileSync(path.join(localDir, 'heroes-talents', 'hero', dataFile)));

  // abilities
  var cards = "";
  for (let ability of heroData.abilities[heroData.name]) {
    const cost = ability.manaCost ? ability.manaCost : 'None';
    const cooldown = ability.cooldown ? ability.cooldown : 'None';
    const front = `${ability.abilityId}`;
    const back = `Name: ${ability.name}<br>Cooldown: ${cooldown}<br>Cost: ${cost}<br>Description: ${ability.description}`;
    const tags = `${heroData.name} ability`;
    cards += `"${front}";"${back}";${tags}\n`;

    console.log(`Found: ${front}`);
  }

  outFile.write(cards, () => { processHeroAbilities(remaining.pop(), remaining, outFile, complete) });
}

function processHeroTalents(dataFile, remaining, outFile, complete) {
    // base case
  if (!dataFile) {
    console.log('Talent Processing Complete');
    complete();
    return;
  }

  console.log(`Processing Talents for ${dataFile}`);
  heroData = JSON.parse(fs.readFileSync(path.join(localDir, 'heroes-talents', 'hero', dataFile)));

  // abilities
  var cards = "";
  for (let tier in heroData.talents) {
    for (let talent of heroData.talents[tier]) {
      const front = `${heroData.name}: ${talent.name} <img src="${talent.icon}">`;
      const back = `Level: ${tier}<br>Description: ${talent.description}<br>Modifies: ${talent.abilityId}`;
      const tags = `${heroData.name} level-${tier} ${talent.abilityId} talent`
      cards += `${front};"${back}";${tags}\n`;

      console.log(`Found: ${talent.name}`);
    }
  }

  outFile.write(cards, () => { processHeroTalents(remaining.pop(), remaining, outFile, complete) });
}

function exportImagesTo(mediaFolder) {
  console.log(`Copying images to ${mediaFolder}`);
  fs.copySync(path.join(localDir, 'heroes-talents', 'images', 'talents'), mediaFolder);
  console.log("Copy complete");
}