/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (context) => {
            // var rec = context.newRecord;
            // var sellingLocation = rec.getText('cseg_sell_location')
            // if(sellingLocation) {
            //     var address = ''
            //     var locationSearchObj = search.create({
            //         type: "location",
            //         filters:
            //             [
            //                 ["name", "is", sellingLocation]
            //             ],
            //         columns:
            //             [
            //                 search.createColumn({
            //                     name: "address",
            //                     join: "returnAddress",
            //                     label: " Address"
            //                 })
            //             ]
            //     });
            //     var searchResultCount = locationSearchObj.runPaged().count;
            //     log.debug("locationSearchObj result count", searchResultCount);
            //     locationSearchObj.run().each(function (result) {
            //       address = result.getValue({
            //           name: 'address',
            //           join: 'returnAddress'
            //       })
            //         return true;
            //     });
            //     rec.setValue({fieldId:'custbody_kd_location_adr', value: address})
            // }
            /*
            locationSearchObj.id="customsearch1655128026782";
            locationSearchObj.title="Kodella | Selling Location Address Search (copy)";
            var newSearchId = locationSearchObj.save();
            */
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (context) => {
            var rec = context.newRecord;
            log.debug('Rec' , rec)
            log.debug('record Type', rec.type)
            if (rec.type == record.Type.SALES_ORDER) {

                log.debug('record Type', rec.type)
                var soRec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: rec.id,
                    isDynamic: true
                })
                var sellingLocation = soRec.getText('cseg_sell_location')
                log.debug('Selling Location Text', sellingLocation)
                if (sellingLocation) {
                    var address = ''
                    var locationSearchObj = search.create({
                        type: "location",
                        filters:
                            [
                                ["name", "is", sellingLocation]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "address",
                                    join: "returnAddress",
                                    label: " Address"
                                })
                            ]
                    });
                    var searchResultCount = locationSearchObj.runPaged().count;
                    log.debug("locationSearchObj result count", searchResultCount);
                    locationSearchObj.run().each(function (result) {
                        address = result.getValue({
                            name: 'address',
                            join: 'returnAddress'
                        })
                        return true;
                    });
                    // record.submitFields({
                    //     type: record.Type.SALES_ORDER,
                    //     id: rec.id,
                    //     values: {
                    //         'custbody_kd_location_adr': address
                    //     },
                    //     options: {
                    //         enableSourcing: false,
                    //         ignoreMandatoryFields: true
                    //     }
                    // });
                    soRec.setValue({fieldId: 'custbody_kd_location_adr', value: address})
                    var soId = soRec.save({ignoreMandatoryFields: true})
                    log.debug('soId', soId)
                }
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
