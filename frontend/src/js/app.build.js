({
    appDir: "../",
    baseUrl: "js/",
    dir: "../../build",
    optimize: "uglify",

    paths: {
        "jquery": "require-jquery"
    },

    modules: [
        {
            name: "main",
            exclude: ["jquery"]
        }
    ]
})
