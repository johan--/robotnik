'use strict';

var browserify = require('browserify');
var es6ify = require('es6ify');
var partialify = require('partialify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

gulp.task('icons', function () {
  return gulp.src([
      './static/vendor/font-awesome/fonts/**.*',
      './static/vendor/bootstrap/fonts/**.*'
    ])
    .pipe(gulp.dest('static/fonts'))
    .on('error', console.log);
});

gulp.task('staticlibs', function () {
  return gulp.src([
      './node_modules/blockly/**',
    ])
    .pipe(gulp.dest('./static/vendor/blockly'))
    .on('error', console.log);
});

gulp.task('bundle', function() {
  return browserify({
      entries: [
        './static/js/src/app.js'
      ],
      debug: true,
      cache: { },
      packageCache: { },
      fullPaths: true
    })
    .transform(partialify)
    .transform(
      // Don't ES6-ify vendor files
      es6ify.configure(/\/robotnik\/static\/js\/src\/.*\.js$/)
    )
    .bundle()
    //Pass desired output filename to vinyl-source-stream
    .pipe(source('bundle.js'))
    // Start piping stream to tasks!
    .pipe(gulp.dest('./static/js/dest'))
});

gulp.task('watch', function() {
  watch(['./static/js/src/**/*.js', './static/js/src/**/*.html'], function() {
    gulp.start('bundle');
  })
});

gulp.task('default', ['icons', 'staticlibs', 'bundle']);
