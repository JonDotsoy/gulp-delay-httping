# Gulp Delay Request
Wait for this ready request before continuing.

## What?
This is useful, if:
* You task require, connection to Web or RESTFul.

### Example 1
```javascript
gulp.task("myTask", () =>
  gulp.src(["to-transform-web/**/*"]).
  pipe(require("gulp-delay-request")({
    url: "http://my-transform-web/"
  })).
  pipe(request("plugint-to-tansform-by-web"))
);
```

### Example 2
```javascript
gulp.task("delay-web", () => require("gulp-delay-request")({
  url: "http://delay-ping-web/"
}));

gulp.task("download", ["delay-web"], (done) => {
  // Here your script to download file.
});
```
