Ext.define('CArABU.technicalservices.UpdateParentMatchMenuItem', {
    alias: 'widget.updateparentmatchbulkrecordmenuitem',
    extend: 'Rally.ui.menu.bulk.MenuItem',

    config: {
        onBeforeAction: function(){
//            console.log('onbeforeaction');
        },

        /**
         * @cfg {Function} onActionComplete a function called when the specified menu item action has completed
         * @param Rally.data.wsapi.Model[] onActionComplete.successfulRecords any successfully modified records
         * @param Rally.data.wsapi.Model[] onActionComplete.unsuccessfulRecords any records which failed to be updated
         */
        onActionComplete: function(){
            console.log('onActionComplete');
        },

        text: 'Update Parent to Matched Portfolio Item...',

        handler: function () {
            var records = this.records,
                parentMatchesToFind = [],
                matchField = this.matchField,
                parentMatchField = this.parentMatchField;

            Ext.Array.each(records, function(r){
                if (!Ext.Array.contains(parentMatchesToFind, r.get(matchField))){
                    parentMatchesToFind.push(r.get(matchField));
                }
            });

            var parentFilters = _.map(parentMatchesToFind, function(r){
                return {
                    property: parentMatchField,
                    value: r
                };
            });
            parentFilters = Rally.data.wsapi.Filter.or(parentFilters);

            Ext.create('Rally.data.wsapi.Store',{
                model: this.parentType,
                fetch: ['ObjectID',this.parentMatchField],
                context: {project: null},
                filters: parentFilters,
                limit: 'Infinity'
            }).load({
                callback: function(parentRecords, operation){
                    if (operation.wasSuccessful()){
                        var hash = {};
                        Ext.Array.each(parentRecords, function(r){
                            hash[r.get(parentMatchField)] = r.get('_ref');
                        });

                        var updatedRecords = [];
                        Ext.Array.each(records, function(r){
                            var match = r.get(matchField);
                            if (hash[match]){
                                r.set('Parent', hash[match]);
                                updatedRecords.push(r);
                            }
                        });

                        var bulkUpdateStore = Ext.create('Rally.data.wsapi.batch.Store', {
                            data: updatedRecords
                        });

                        bulkUpdateStore.sync({
                            success: function(batch) {
                               console.log('batch successful!!', batch, updatedRecords);
                            },
                            failure: function(){
                                console.log('bulkUpdateStore failed')
                            }
                        });


                    } else {

                    }
                }
            });

        },
        predicate: function (records) {
            var matchField = this.matchField;
            return _.every(records, function (record) {
                return record.get(matchField) && record.get(matchField).length > 0;
            });
        }
    }
});