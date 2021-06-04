const fs = require('fs')

const loadStaticDataSync = () => {
    let data = fs.readFileSync('./STATIC_DATA.json');
    return JSON.parse(data);
} 

exports.loadStaticDataSync = loadStaticDataSync 