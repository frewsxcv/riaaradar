#!/bin/sh

node r.js -o src/js/app.build.js
sass --style compressed build/style/style.scss build/style/style.css
