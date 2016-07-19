Ext.define("parent-updater-by-field", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'}
    ],

    config: {
        defaultSettings: {
            childMatchField: "c_ExternalID",
            parentMatchField: "c_ExternalID",
            childType: "PortfolioItem/Feature",
            parentType: "PortfolioItem/Initiative"
        }
    },

    integrationHeaders : {
        name : "parent-updater-by-field"
    },
                        
    launch: function() {
        this.buildStore();
    },

    buildStore: function(){
        this.down('#display_box').removeAll();

        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: this.getModelNames(),
            enableHierarchy: true,
            fetch: this.getChildFetchList(),
            filters: this.getChildFilters()
        }).then({
            success: this.buildGrid,
            scope: this,
            failure: this.showError
        });

    },
    showError: function(operation){
        this.logger.log('showError', operation);
    },
    buildGrid: function(store){
        this.logger.log('buildGrid', store);

        this.down('#display_box').add({
            xtype: 'rallygridboard',
            context: this.getContext(),
            modelNames: this.getModelNames(),
            toggleState: 'grid',
            plugins: [
                this.getFilterPlugin(),
                this.getFieldPickerPlugin()
            ],
            gridConfig: {
                store: store,
                enableRanking: false,
                enableBulkEdit: true,
                shouldShowRowActionsMenu: false,
                storeConfig: {
                    filters: this.getChildFilters()
                },
                bulkEditConfig: {
                    items: [{
                        xtype: 'updateparentmatchbulkrecordmenuitem',
                        matchField: this.getChildMatchField(),
                        parentMatchField: this.getParentMatchField(),
                        parentType: this.getParentType()
                    }]
                },
                columnCfgs: [
                    'FormattedID',
                    'Name'
                ]
            },
            height: this.getHeight()
        });
    },
    getFilterPlugin: function(){
        return {
            ptype: 'rallygridboardinlinefiltercontrol',
            inlineFilterButtonConfig: {
                stateful: true,
                stateId: this.getContext().getScopedStateId('ctd-filters'),
                modelNames: this.getModelNames(),
                inlineFilterPanelConfig: {
                    quickFilterPanelConfig: {
                        defaultFields: [
                            'ArtifactSearch',
                            'Owner',
                            'ModelType'
                        ]
                    }
                }
            }
        };
    },
    getFieldPickerPlugin: function(){
        return {
            ptype: 'rallygridboardfieldpicker',
            headerPosition: 'left',
            modelNames: this.getModelNames(),
            stateful: true,
            stateId: this.getContext().getScopedStateId('ctd-columns-1')
        };
    },
    getChildFetchList: function(){
        return ['FormattedID','Name','Parent',this.getChildMatchField(), this.parentMatchField];
    },
    getChildFilters: function(){
        return [{
            property: this.getSetting('childMatchField'),
            operator: "!=",
            value: ""
        }];
    },
    getChildMatchField: function(){
        return this.getSetting('childMatchField');
    },
    getParentMatchField: function(){
        return this.getSetting('parentMatchField');
    },
    getParentType: function(){
        return this.getSetting('parentType');
    },
    getModelNames: function(){
        return [this.getSetting('childType')];
    },
    getSettingsFields: function(){
        var settings = this.getSettings();

        return [{
            xtype: 'rallyfieldcombobox',
            model: settings.parentType,
            name: 'parentMatchField',
            fieldLabel: "Parent Match Field"
        },{
            xtype: 'rallyfieldcombobox',
            model: settings.childType,
            name: 'childMatchField',
            fieldLabel: "Child Match Field"
        }];
    },
    
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    },
    
    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings){
        this.logger.log('onSettingsUpdate',settings);
        // Ext.apply(this, settings);
        this.launch();
    }
});
