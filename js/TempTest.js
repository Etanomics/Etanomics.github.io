(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
    var cols = [{
        id: "datum",
        dataType: tableau.dataTypeEnum.datetime
    }, {
        id: "temperatur",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "taupunkt",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "feuchtigkeit",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "schneefall",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "windgeschwindigkeit",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "spitzenboee",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "druck",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "niederschlag",
        dataType: tableau.dataTypeEnum.float
    }];

    var tableSchema = {
        id: "Wetter",
        alias: "Wetter in London Airport",
        columns: cols
    };

    schemaCallback([tableSchema]);
};

   myConnector.getData = function(table, doneCallback) {
    $.getJSON("https://api.meteostat.net/v1/history/hourly?station=03772&start=2020-03-16&end=2099-01-01&time_zone=Europe/London&time_format=Y-m-d%20H:i&key=aaCp5YRV", function(resp) {
        var feat = resp.data,
            tableData = [];

        // Iterate over the JSON object
        for (var i = 0, len = feat.length; i < len; i++) {
            tableData.push({
                "datum": feat[i].time_local,
                "temperatur": feat[i].temperature,
                "taupunkt": feat[i].dewpoint,
                "feuchtigkeit": feat[i].humidity,
                "schneefall": feat[i].snowdepth,
                "windgeschwindigkeit": feat[i].windspeed,
                "spitzenboee": feat[i].peakgust,
                "druck": feat[i].pressure,
                "niederschlag": feat[i].precipitation
            });
        }

        table.appendRows(tableData);
        doneCallback();
    });
};

    tableau.registerConnector(myConnector);
    $(document).ready(function () {
    $("#submitButton").click(function () {
        tableau.connectionName = "Wetter in London";
        tableau.submit();
    });
});
})();