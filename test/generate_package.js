var fs = require('fs');
var ejs = require('ejs');

var options = {
    name: "Test1",
    author: "JB",
    nameSlug: "test-1",
    nameCamel: "Test1",
    projectType: "fe",
    features: {
        has_babel: true,
        has_jquery: true
    }
}

var file = fs.readFileSync('../generators/app/templates/package.json', 'utf8');
var generatedFile = ejs.render(file, options);
fs.writeFileSync('generated_project/package.json', generatedFile);
