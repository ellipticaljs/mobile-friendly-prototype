var config=require('./config.json');
var Tasks=require('elliptical-gulp');
var gulp=require('gulp');


var tasks=new Tasks(config);


gulp.task('default',function(){
    tasks.default();
});

gulp.task('start-live-server',function(){
    tasks.startLiveServer();
});

gulp.task('start-server',function(){
    tasks.startServer();
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

gulp.task('start-live-app-no-sass',function(){
    tasks.startLiveAppNoSass();
});

gulp.task('start-app-no-sass',function(){
    tasks.startAppNoSass();
});

gulp.task('start-live-scripts',function(){
    tasks.startLiveScripts();
});

gulp.task('start-scripts',function(){
    tasks.startScripts();
});

gulp.task('sass-compile', function () {
    tasks.sassCompile();
});

gulp.task('sass-watch', function () {
    tasks.sassWatch();
});

gulp.task('scripts-watch', function () {
    tasks.scriptsWatch();
});

gulp.task('scripts-build', function () {
    tasks.scriptsBuild();
});

gulp.task('app-watch', function () {
    tasks.appWatch();
});

gulp.task('app-build', function () {
    tasks.appBuild();
});

gulp.task('vulcanize', function () {
    tasks.vulcanize();
});

gulp.task('app-build-imports', function () {
    tasks.appBuildImports();
});

gulp.task('app-watch-imports', function () {
    tasks.appWatchImports();
});