const fs = require('fs');
const R = require('ramda');

const FOLDER_NAME = `data`;

fs.readdirAsync = dirname =>
  new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, filenames) => {
      if (err) reject(err);
      else resolve(filenames);
    });
  });

fs.readFileAsync = (filename, enc) =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, enc, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

const getFile = filename => {
  return fs.readFileAsync(`${FOLDER_NAME}/${filename}`, 'utf8');
};

const isDataFile = filename => {
  return (
    filename.split('.')[1] == 'json' &&
    filename.split('.')[0] != 'heroes' &&
    filename.split('.')[0] != 'matchesId' &&
    filename.split('.')[0] != 'allMatches' &&
    filename.split('.')[0] != 'package'
  );
};

fs.writeFile('data/allMatches.json', '', () => {
  console.log('done');
});

fs.readdirAsync(FOLDER_NAME)
  .then(filenames => {
    filenames = filenames.filter(isDataFile);
    return Promise.all(filenames.map(getFile));
  })
  .then(files => {
    let summaryFiles = [];
    files.forEach(file => {
      let json = JSON.parse(file);
      summaryFiles.push(json);
    });
    fs.appendFile(
      'data/allMatches.json',
      JSON.stringify([].concat.apply([], summaryFiles), null, 4),
      err => {
        if (err) {
          return console.log(err);
        }
        console.log('The file was appended!');
      }
    );
  });
