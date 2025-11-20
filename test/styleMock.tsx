// blank mock export for Jest testing with SCSS/CSS imports
// The problem is that Jest is hitting CSS imports and 
// trying to parse them as if they were JavaScript.,
// we get error of SyntaxError: Unexpected token .,
// The moduleNameMapper setting tells Jest how to interpret 
// files with different extensions. In this case we simply 
// need to point it at this empty file
module.exports = {};