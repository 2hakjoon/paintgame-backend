import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import gimage from "gulp-image";
import sass from "gulp-sass";
import autop from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import brom from "gulp-bro";
import babelify from "babelify";


sass.compiler = require("node-sass");

const routes = {
    pug : {
        watch : "views/*",
        src:"views/*.pug",
        dest : "build"
    },
    img:{
        src: "src/img/*",
        dest: "build/img"
    },
    scss:{
        watch:"src/scss/**/*.scss",
        src: "src/scss/index.scss",
        dest: "build/css",
    },
    js : {
        watch : "src/js/**/*.js",
        src: "src/js/main.js",
        dest: "build/js"
    }
}

const pug = () => gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build"]);

const webserver = () => {
    gulp.src("build")
    .pipe(ws({livereload:true, open:true}))
};

const js = () => gulp.src(routes.js.src).pipe(brom({
    transform : [
        babelify.configure({ presets : ['@babel/preset-env']}),
        ["uglifyify", {global:true}]
    ]
})).pipe(gulp.dest(routes.js.dest));

const img = () => 
    gulp.src(routes.img.src)
    .pipe(gimage())
    .pipe(gulp.dest(routes.img.dest));


const styles = () => 
    gulp.src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autop())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));


const watch = () => 
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.watch, js);


const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const postDev = gulp.series([webserver, watch]);

export const dev = gulp.series([prepare, assets, postDev]);
