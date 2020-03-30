(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
    var cols = [{
        id: "datum_utc",
        alias:"Datum (UTC-Zeit)",
        dataType: tableau.dataTypeEnum.datetime
    }, {
        id: "datum_local",
        alias:"Datum (lokale Zeit)",
        dataType: tableau.dataTypeEnum.datetime
    }, {
        id: "temperatur",
        alias:"Temperatur [°C]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "taupunkt",
        alias:"Taupunkt [°C]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "feuchtigkeit",
        alias:"Feuchtigkeit [%]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "schneefall",
        alias:"Schneefall [mm]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "windgeschwindigkeit",
        alias:"Windgeschwindigkeit [km/h]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "spitzenboee",
        alias:"Spitzenböe [km/h]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "windrichtung",
        alias:"Windrichtung [°]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "druck",
        alias:"Druck [hPa]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "niederschlag",
        alias:"Niederschlag über 1h [mm]",
        dataType: tableau.dataTypeEnum.float
    }];

    var tableSchema = {
        id: "Wetter",
        alias: "Wetter für ausgewählte Station",
        columns: cols
    };

    schemaCallback([tableSchema]);
};

   myConnector.getData = function(table, doneCallback) {
    var infoObj = JSON.parse(tableau.connectionData),
        dateString = "station=" + infoObj.stationnumber + "&start=" + infoObj.startDate + "&end=" + infoObj.endDate + "&time_zone=" + infoObj.timezone + "&time_format=Y-m-d%20H:i&key=" + infoObj.key,
        apiCall = "https://api.meteostat.net/v1/history/hourly?" + dateString;

        $.getJSON(apiCall, function(resp) {
        var feat = resp.data,
            tableData = [];

        // Iterate over the JSON object
        for (var i = 0, len = feat.length; i < len; i++) {
            tableData.push({
                "datum_utc": feat[i].time,
                "datum_local": feat[i].time_local,
                "temperatur": feat[i].temperature,
                "taupunkt": feat[i].dewpoint,
                "feuchtigkeit": feat[i].humidity,
                "schneefall": feat[i].snowdepth,
                "windgeschwindigkeit": feat[i].windspeed,
                "spitzenboee": feat[i].peakgust,
                "windrichtung": feat[i].winddirection,
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
    $("#submitButton").click(function() {
            var infoObj = {
                startDate: $('#start-date-one').val().trim(),
                endDate: $('#end-date-one').val().trim(),
                stationnumber: $('#stationnumber-one').val().trim(),
                timezone: $('#timezone-one').val().trim(),
                key: $('#key-one').val().trim(),
            };

            // Simple date validation: Call the getDate function on the date object created
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(infoObj.startDate) && isValidDate(infoObj.endDate)) {
                tableau.connectionData = JSON.stringify(infoObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "Wetterdaten Station " + infoObj.stationnumber + " vom " + infoObj.startDate + " bis " + infoObj.endDate; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2016-05-08.");
            }
        });
});
})();