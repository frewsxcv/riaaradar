({
    appDir: "../",
    baseUrl: "script/",
    dir: "../../build",
    optimize: "uglify",

    stubModules: ["cs"],

    paths: {
        "jquery": "require-jquery"
    },

    modules: [
        {
            name: "main",
            exclude: ["jquery", "coffee-script"]
        }
    ]
})
