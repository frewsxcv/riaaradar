define(["jquery"], function ($) {
    // MusicBrainz label from API
    var Label = function (mbLabel) {
        var $mbLabel = $(mbLabel);

        this.catalogNum = $mbLabel.children("catalog-number").text();

        this.mbid = $mbLabel.children("label").attr("id");

        this.name = $mbLabel.children("label").children("name").text();
    };

    Label.prototype.getRiaaPath = function (callback) {
        var query = "/server?mbid=" + this.mbid;
        $.ajax({
            url: query,
            dataType: "json",
            success: function (data) {
                if (data.path !== undefined) {
                    callback(data.path);
                }
            },
            failure: function () {
                alert("Unable to connect to the RIAA Radar servers");
            }
        });

    };

    return Label;
});
