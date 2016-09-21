var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');

module.exports = function(newTS, lib, output, reporter) {
	var project = newTS.createProject('test/sourceMaps/Main/tsconfig.json', {
		typescript: lib
	});

	reporter.outputSrcGlob(project);
	return project.src()
		.pipe(sourcemaps.init())
		.pipe(newTS(project, undefined, reporter)).js
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(output + "js/Main"));
}
