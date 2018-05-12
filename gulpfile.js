const gulp = require('gulp');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const webpackDevConfig = require('./webpack.config.js');
const del = require('del');

const src = 'src';

const paths = {
  sw: `${src}/sw.js`,
  html: `${src}/**/*.html`,
  css: `${src}/**/*.css`,
  js: `${src}/**/*.js`,
  dist: 'dist'
}

gulp.task('clean', function() {
  return del([paths.dist]);
});

gulp.task('html', ['clean'], function(){
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css', ['clean'], function(){
  return gulp.src(paths.css)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('sw', ['clean'], function(){
  return gulp.src(paths.sw)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('webpack', ['clean'], function(){
  return gulp.src(`${src}/js/main.js`)
    .pipe(gulpWebpack(webpackDevConfig, webpack))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', function() {
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.sw, ['sw']);
  gulp.watch(paths.js, ['webpack']);
});

gulp.task('default', [ 'html', 'css', 'sw', 'webpack' ]);
