var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

gulp.task("default",function(){
    return gulp.src("src/**/*.js")//es6源码存放的路径
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat("datetimepicker.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/scripts"))//转换成es5存放的路径
        // .pipe(rename({suffix:".min"}))
        // .pipe(uglify())
        // .pipe(gulp.dest("dist/scripts"))
})
