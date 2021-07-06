(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
    var cols = [{
        id: "timestamp",
        alias:"Timestamp",
        dataType: tableau.dataTypeEnum.date
    }, {
        id: "temperatur",
        alias:"durchschnittliche Temperatur [°C]",
        dataType: tableau.dataTypeEnum.float
    },  {
        id: "mintemperatur",
        alias:"minimale Temperatur [°C]",
        dataType: tableau.dataTypeEnum.float
    },  {
        id: "maxtemperatur",
        alias:"maximale Temperatur [°C]",
        dataType: tableau.dataTypeEnum.float
    },  {
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
        alias:"Windrichtung [°] (Azimutwinkel)",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "druck",
        alias:"Druck [hPa]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "sonne",
        alias:"Sonnenscheindauer [min]",
        dataType: tableau.dataTypeEnum.float
    }, {
        id: "wetterstationsnummer",
        alias:"Wetterstationsnummer Meteostat",
        dataType: tableau.dataTypeEnum.string
    }, {
        id: "niederschlag",
        alias:"Niederschlag [mm]",
        dataType: tableau.dataTypeEnum.float
    }];

    var tableSchema = {
        id: "Wetterdaten",
        alias: "Wetterdaten für ausgewählte Station",
        columns: cols
    };

    schemaCallback([tableSchema]);
};

 
    myConnector.getData = function(table, doneCallback) {
    var infoObj = JSON.parse(tableau.connectionData),
        dateString = "station=" + infoObj.stationnumber + "&start=" + infoObj.startDate + "&end=" + infoObj.endDate,
        apiCall = "https://meteostat.p.rapidapi.com/stations/daily?" + dateString;

       $.ajaxSetup({

              headers : {

                'x-rapidapi-key': 'fee9086504msh0413f59f40ea9a7p19cc54jsn4ab4d6d14c67',
                'x-rapidapi-host': 'meteostat.p.rapidapi.com'

              }

            });
       
        $.getJSON(apiCall, function(resp) {
        var feat = resp.data,
            tableData = [];

        // Iterate over the JSON object
        for (var i = 0, len = feat.length; i < len; i++) {
            tableData.push({
                "timestamp": feat[i].date,
                "temperatur": feat[i].tavg,
                "mintemperatur": feat[i].tmin,
                "maxtemperatur": feat[i].tmax,
                "schneefall": feat[i].snow,
                "windgeschwindigkeit": feat[i].wspd,
                "spitzenboee": feat[i].wpgt,
                "windrichtung": feat[i].wdir,
                "druck": feat[i].pres,
                "sonne": feat[i].tsun,
                "wetterstationsnummer": infoObj.stationnumber,
                "niederschlag": feat[i].prcp
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
            };
        
            // Simple date validation: Call the getDate function on the date object created
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(infoObj.startDate)) {
                tableau.connectionData = JSON.stringify(infoObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "Rapid API Wetterdaten Station " + infoObj.stationnumber + " ab " + infoObj.startDate + " bis " + infoObj.endDate; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2016-05-08.");
            }
        });
});
})();