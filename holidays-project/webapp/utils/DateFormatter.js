sap.ui.define([], function() {
    "use strict";

    return {
        formatDate: function(dateString) {
            if (!dateString) {
                return "";
            }

            // Verifica se dateString è già un oggetto Date, altrimenti convertilo in una stringa
            if (typeof dateString === "string") {
                dateString = new Date(dateString);
            }

            // Verifica che l'oggetto Date sia valido
            if (isNaN(dateString)) {
                return "";
            }

            // Formatta la data nel formato "dd/MM/yyyy"
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "dd/MM/yyyy"});
            return oDateFormat.format(dateString);
        }
    };
});
