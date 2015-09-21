// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Lint Task
gulp.task('lint', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src('src/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src(['src/js/models/*.js', 'src/js/collections/*.js', 'src/js/views/*.js'])
    .pipe(concat('multi.js'))
    .pipe(gulp.dest('dist/js'))
});

// Copy html file
gulp.task('copy', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/*.html', ['copy']);
});

// Default Task
gulp.task('default', ['scripts', 'sass', 'copy', 'watch']);