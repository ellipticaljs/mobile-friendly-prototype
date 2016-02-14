gulp.task('default',function(){
    tasks.default();
});

gulp.task('start-live',function(){
    tasks.startLive();
});

gulp.task('start',function(){
    tasks.start();
});

gulp.task('start-live',function(){
    tasks.startLive();
});

gulp.task('start-app',function(){
    tasks.startApp();
});

gulp.task('start-live-app',function(){
    tasks.startLiveApp();
});

gulp.task('start-live-sass',function(){
    tasks.startLiveSass();
});

gulp.task('start-sass',function(){
    tasks.startSass();
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

gulp.task('app-watch', function () {
    tasks.appWatch();
});

gulp.task('app-build', function () {
    tasks.appBuild();
});

gulp.task('vulcanize', function () {
    tasks.vulcanize();
});

gulp.task('app-write-imports', function () {
    tasks.AppWriteImports();
});

gulp.task('app-watch-imports', function () {
    tasks.AppWatchImports();
});