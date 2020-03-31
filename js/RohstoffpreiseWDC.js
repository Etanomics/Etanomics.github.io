(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
    var cols = [{
        id: "datum",
        alias:"Datum",
        dataType: tableau.dataTypeEnum.date
        }, {
        id: "preis",
        alias:"Preis",
        dataType: tableau.dataTypeEnum.float
        }, {
        id: "einheit",
        alias:"Einheit",
        dataType: tableau.dataTypeEnum.string
        }];

    var tableSchema = {
        id: "Rohstoffpreise",
        alias: "Rohstoffpreise für ausgewählten Rohstoff, bereitgestellt von der Weltbank",
        columns: cols
    };

    schemaCallback([tableSchema]);
};

   myConnector.getData = function(table, doneCallback) {
    var infoObj = JSON.parse(tableau.connectionData),
        dateString = "dataseries/" + infoObj.code + "/data?lang=en&start_date=" + infoObj.startDate + "&end_date=" + infoObj.endDate + "&period=D&currency=" + infoObj.currency + "&unit=" + infoObj.unit + "&fill_gaps&api_token=" + infoObj.key,
        apiCall = "https://api.commoprices.com/v2/" + dateString;

        $.getJSON(apiCall, function(resp) {
        var feat = resp.data.request.dataseries,
            unit2 = resp.data.request.price_unit.name,
            tableData = [],
            str,
            str2,
            str3,
            str4,
            numb;

        // Iterate over the JSON object
        for (var i = 0, len = feat.length; i < len; i++) {
            str = JSON.stringify(feat[i]);
            str2 = str.slice(2,12);
            str4 = str.slice(14);
            numb = parseFloat(str4);
            str3 = JSON.stringify(unit2);
            tableData.push({
                "datum": str2,
                "preis": numb,
                "einheit": str3
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
                code: $('#code-one').val().trim(),
                currency: $('#currency-one').val().trim(),
                unit: $('#unit-one').val().trim(),
                key: $('#key-one').val().trim(),
            };

            // Simple date validation: Call the getDate function on the date object created
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(infoObj.startDate) && isValidDate(infoObj.endDate)) {
                tableau.connectionData = JSON.stringify(infoObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "Rohstoffpreise in " + infoObj.currency + "/ Währung<" + infoObj.unit + "> für " + infoObj.code + " vom " + infoObj.startDate + " bis " + infoObj.endDate; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2016-05-08.");
            }
        });
});
})();