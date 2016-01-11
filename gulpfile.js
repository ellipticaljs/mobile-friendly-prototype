var config=require('./config.json');
var Tasks=require('elliptical-gulp');
var gulp=require('gulp');
var vulcanize = require('gulp-vulcanize');

var tasks=new Tasks(config);

gulp.task('default',function(){
    tasks.default();
});

gulp.task('start-live',function(){
    tasks.startLive();
});

gulp.task('start',function(){
    tasks.start();
});

gulp.task('start-live-app',function(){
    tasks.startLiveApp();
});

gulp.task('start-app',function(){
    tasks.startApp();
});

gulp.task('start-live-sass',function(){
    tasks.startLiveSass();
});

gulp.task('start-sass',function(){
    tasks.startSass();
});

gulp.task('sass-compile', function () {
    compileSass(config.path);
});

gulp.task('sass-watch', function () {
    tasks.sassWatch();
});

gulp.task('scripts-watch', function () {
    tasks.scriptsWatch();
});

gulp.task('app-watch', function () {
    tasks.appWatch();
});

gulp.task('app-build', function () {
    tasks.appBuild();
});

gulp.task('component-build', function () {
    tasks.componentBuild();
});

gulp.task('vulcanize', function () {
    return gulp.src('./public/imports/import.html')
        .pipe(vulcanize({
            abspath: '',
            excludes: [],
            stripExcludes: false
        }))
        .pipe(gulp.dest('./public/vulcanized'));
});