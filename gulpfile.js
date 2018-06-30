const gulp = require('gulp');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const webpackDevConfig = require('./webpack.dev.config.js');
const webpackProdConfig = require('./webpack.prod.config.js');
const del = require('del');

const src = 'src';

const paths = {
  workers: `${src}/*.js`,
  html: `${src}/**/*.html`,
  css: `${src}/**/*.css`,
  js: `${src}/**/*.js`,
  manifest: `${src}/manifest.webmanifest`,
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

gulp.task('workers', ['clean'], function(){
  return gulp.src(paths.workers)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('manifest', ['clean'], function(){
  return gulp.src(paths.manifest)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('webpack', ['clean'], function(){
  return gulp.src(`${src}/js/main.js`)
    .pipe(gulpWebpack(webpackDevConfig, webpack))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('webpack-prod', ['clean'], function(){
  return gulp.src(`${src}/js/main.js`)
    .pipe(gulpWebpack(webpackProdConfig, webpack))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('icons', ['clean'], function(){
  return gulp.src(`${src}/icon/*.*`)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', function() {
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.workers, ['workers']);
  gulp.watch(paths.js, ['webpack']);
});

gulp.task('default', [ 'html', 'css', 'icons', 'workers', 'manifest', 'webpack' ]);

gulp.task('build-prod', [ 'html', 'css', 'icons', 'workers', 'manifest', 'webpack-prod' ]);
