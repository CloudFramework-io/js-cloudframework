var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('build', function(){
    return gulp.src([
        'bower_components/js-cookie/src/js.cookie.js'
        ,'bower_components/fetch/fetch.js'
        ,'src/*'
        ])
        .pipe(concat('js-cloudframework.js'))
        .pipe(gulp.dest('test/js'))
});

gulp.task('watch',function () {
    gulp.watch('src/*', ['build']);
});
// The development server (the recommended option for development)
gulp.task('serve', ['build','watch']);