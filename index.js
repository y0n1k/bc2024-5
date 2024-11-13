const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const express = require('express');
const program = new Command();
const app = express();

program
  .option('-h, --host <type>', 'server host')
  .option('-p, --port <type>', 'server port')
  .option('-c, --cache <path>', 'cache directory')
  .parse(process.argv);
  
const option = program.opts();

app.use(express.json());

if(!option.host){
    console.error("Вкажіть адресу сервера")
    process.exit(1);
}
if(!option.port){
    console.error("Вкажіть порт")
    process.exit(1);
}
if(!option.cache){
    console.error("Вкажіть папку для кешу")
    process.exit(1);
}
const { host, port, cache } = program.opts();
console.log(`Host: ${host}\nPort: ${port}\nCache Directory: ${cache}`);

const cachePath = path.resolve(option.cache);
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

app.listen(option.port, option.host, () => {
    console.log(`Server is running on http://${option.host}:${option.port}`);
});

app.get('/notes/:noteName', (req, res) => {
    const notePath = path.join(option.cache, req.params.noteName);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }

    const noteText = fs.readFileSync(notePath, 'utf8');
    res.send(noteText);
});

app.put('/notes/:noteName', (req, res) => {
    const notePath = path.join(option.cache, req.params.noteName);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    const newText = req.body.text;
    if (newText === undefined) {
        return res.status(400).send('Text is required');
    }
    fs.writeFileSync(notePath, newText);
    res.send('Note updated');
});

app.delete('/notes/:noteName', (req, res) => {
    const notePath = path.join(option.cache, req.params.noteName);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }

    fs.unlinkSync(notePath);
    res.send('Note deleted');
});