if(!process.env['TEST_VERSIONS'] || process.env['TEST_VERSIONS'] != 'generated_project') {
  process.exit();
}

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
  },
  has_jquery_vendor_config: false,
}

var file = fs.readFileSync('../generators/app/templates/package.json', 'utf8');
var generatedFile = ejs.render(file, options);
fs.writeFileSync('generated_project/package.json', generatedFile);
