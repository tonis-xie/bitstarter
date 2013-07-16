#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var buildCheck = function(checksfile) {
    var checkResponse = function(result, response) {
	if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            fs.writeFileSync('result.html', result);
            $ = cheerio.load(result);
            var sel = $('.col.dealing > div');
    	    for(var ii in sel) {
    		  console.log(sel[ii].children.data);
    	    }
        }
    };
    return checkResponse; 
};

var checkUrl = function(url, checksfile) {
    var checkResponse = buildCheck(checksfile);
    rest
      .get(url, {query:'spm=a230r.1.8.3.MDdaVT&promote=0&sort=sale-desc&initiative_id=tbindexz_20130711&tab=all&q=%BB%AF%D7%B1%C6%B7&style=list#J_relative'})
      .on('complete', checkResponse);
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
 //    program
 //        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
 //        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
 //        .option('-u, --url <url>', 'Url to html file for check')
 //        .parse(process.argv);
 //    if(program.url) {
	// checkUrl(program.url, program.checks);
 //    } else {
	// var checkJson = checkHtmlFile(program.file, program.checks);
	// var outJson = JSON.stringify(checkJson, null, 4);
	// console.log(outJson);
 //    }
    checkUrl('http://s.taobao.com/search',
        program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}