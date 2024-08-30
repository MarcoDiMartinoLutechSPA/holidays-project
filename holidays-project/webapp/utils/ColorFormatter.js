sap.ui.define([], function() {
    "use strict";

    return {
        statusState: function(sStatus) {
            if (sStatus === "Delivered") {
                return "Success";  // Verde
            } else if (sStatus === "Initial") {
                return "Warning";  // Giallo
            } else {
                return "None";  // Colore di default
            }
        }
    };
});