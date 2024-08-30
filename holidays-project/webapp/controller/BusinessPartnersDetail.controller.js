sap.ui.define([
    "sap/btp/holidaysproject/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
      "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], 

function (BaseController, JSONModel, ODataModel, Filter, FilterOperator, Spreadsheet, exportLibrary) 
{
    "use strict";

    const EdmType = exportLibrary.EdmType;
    const url_oData = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/";

    return BaseController.extend("sap.btp.holidaysproject.controller.BusinessPartnersDetail", 
    {
        onInit: function() {
            this.loadBusinessPartners();
        },
        
        loadBusinessPartners: function() {
            var oModel = new ODataModel(url_oData);

            this.fetchDataFromOData("BusinessPartnerSet", oModel, null).then(function(oData) {
                var oBusinessPartners = new JSONModel(oData.results);
                this.getView().setModel(oBusinessPartners, "BusinessPartnersTableModel");
            }.bind(this)).catch(function(error) {
                console.error("Errore durante il recupero dei dati dei Business Partners:", error);
            });
        },

        onValueHelp: async function() 
        {
            if(!this._oDialog) 
            {
                this._oDialog = sap.ui.xmlfragment("valueHelp", "sap.btp.holidaysproject.view.fragment.ValueHelpCompanyName", this);
                this.getView().addDependent(this._oDialog);

                try {
                    var oModel = new ODataModel(url_oData);
                    var oData = await this.fetchDataFromOData("BusinessPartnerSet", oModel, null);

                    this.getView().setModel(new JSONModel(oData.results), "companyNameTableModel");
                } catch(error) {
                    console.error("Errore nel recuperare i dati: ", error);
                }

                this._oDialog.open();
            } 
            else 
            {
                this._oDialog.open();
            }
        },

        onCloseFragment: function() {
            this._oDialog.close();
            this._oDialog.destroy();
            this._oDialog = undefined;
        },

        onOKPressed: function() 
        {
            var oSelectedItem = sap.ui.core.Fragment.byId("valueHelp", "companyNameTable").getSelectedItem();
            var oBindingContext = oSelectedItem.getBindingContext("companyNameTableModel");
            var sCompanyName = oBindingContext.getProperty("CompanyName"); 
            var oInputCompanyName = this.getView().byId("valueHelp");
            oInputCompanyName.setValue(sCompanyName);

            this.onCloseFragment();
        },

        onSearch: function () 
        {
            var oView = this.getView();
            var oTable = oView.byId("BusinessPartnersTable");
            var oBinding = oTable.getBinding("items");

            var sCompanyName = oView.byId("valueHelp").getValue();

            var aFilters = [];

            if (sCompanyName) {
                aFilters.push(new Filter("CompanyName", FilterOperator.Contains, sCompanyName));
            }
            
            oBinding.filter(aFilters);
        },
        
        onDateChange: function () {
            this.onSearch();
        },

        onShowAddress: function(oEvent) 
        {
            var oButton = oEvent.getSource();
            var oBindingContext = oButton.getBindingContext("BusinessPartnersTableModel");
            var sBusinessPartnerID = oBindingContext.getProperty("BusinessPartnerID");

            if (!this._oAddressDialog) {
                this._oAddressDialog = sap.ui.xmlfragment("sap.btp.holidaysproject.view.fragment.AddressDialog", this);
                this.getView().addDependent(this._oAddressDialog);
            }

            var oModel = new ODataModel(url_oData);
            var sAddressPath = "/BusinessPartnerSet('" + sBusinessPartnerID + "')/Address";
            
            oModel.read(sAddressPath, 
            {
                success: function(oData) 
                {
                    var oAddressModel = new JSONModel(oData);
                    this._oAddressDialog.setModel(oAddressModel, "AddressTableModel");
                    this._oAddressDialog.open();
                }.bind(this),
                error: function(oError) 
                {
                    console.error("Errore durante il recupero dell'indirizzo:", oError);
                }
            });
        },

        onCloseAddressDialog: function() {
            this._oAddressDialog.close();
        },

        createColumnConfig: function() 
        {
            // Recupera il modello i18n
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            return [
                {
                    label: oResourceBundle.getText("columnTextBusinessPartnerID"),
                    property: "BusinessPartnerID",
                    type: EdmType.String
                },
                {
                    label: oResourceBundle.getText("columnTextCompanyName"), 
                    property: "CustomerName",
                    type: EdmType.String,
                },
                {
                    label: oResourceBundle.getText("columnTextCurrencyCode"),  
                    property: "CurrencyCode",
                    type: EdmType.String,
                },
                {
                    label: oResourceBundle.getText("columnTextBusinessPartnerRole"),  
                    property: "BusinessPartnerRole",
                    type: EdmType.String
                }
            ];
        },
        
        onExport: function() {
            var aCols, oRowBinding, oSettings, oSheet, oTable;
        
            if (!this._oTable) {
                this._oTable = this.byId('BusinessPartnersTable');
            }
        
            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items'); 
        
            // Recupera solo i dati filtrati
            var aFilteredData = oRowBinding.getContexts().map(function(oContext) {
                return oContext.getObject();
            });
        
            aCols = this.createColumnConfig();
        
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: aFilteredData,
                fileName: 'BusinessPartnersDetail.xlsx',
                worker: false
            };
        
            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function() {
                oSheet.destroy();
            });
        },

        onNavBack: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView1");
        }
    });
});