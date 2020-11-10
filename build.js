var fs = require('fs');
var archiver = require('archiver');
var ncp = require('ncp').ncp;
var distPath = './dist'
var buildPath = './qliksense-add-in-src';

// Copy files
function copyFiles(src, des) {
    return new Promise((resolve, reject) => {
        console.log(src + " copied " + "to" + des + '\n');
        ncp(src, des, function(err){
            err ? reject : resolve();
        });
    })
}

// Zip directories the needed
function zipDirectory () {
    var output = fs.createWriteStream('./dist/qliksense-add-in-src.zip');
    var archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('Build file created successfully');
    });

    archive.on('error', function(err){
        throw err;
    });

    archive.pipe(output);
    archive.directory('qliksense-add-in-src');
    archive.finalize();
}

// Create dist if it does not exist and zip the project
var build = async () => {
    try{

        if (!fs.existsSync(distPath)){
            fs.mkdirSync(distPath);
        }
        
        if (!fs.existsSync(buildPath)){
            fs.mkdirSync(buildPath);
        }

        
        await copyFiles('./css', buildPath + '/css');
        await copyFiles('./js', buildPath + '/js');
        await copyFiles('./arria.png', buildPath + '/arria.png');
        await copyFiles('./arriaExt.js', buildPath + '/arriaExt.js');
        await copyFiles('./arriaExt.qext', buildPath + '/arriaExt.qext');
        await copyFiles('./icon.png', buildPath + '/icon.png');
        await copyFiles('./wbfolder.wbl', buildPath + '/wbfolder.wbl');
        await copyFiles('./README.md', buildPath + '/README.md');

        zipDirectory();
    } catch(e) {
        console.error(e);
    }
}

build();

