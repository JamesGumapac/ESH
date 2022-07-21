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
        function getDefaultSelFulLocation(subsidiary) {
            var sellingLocation = ''
            var fulfillingLoation = ''
            var subRec = record.load({
                type: 'subsidiary',
                id: subsidiary,
                isDynamic: true
            })
            sellingLocation = subRec.getValue('custrecord_kd_def_selling_location')
            fulfillingLoation = subRec.getValue('custrecord_kd_def_fulfilling_location')
            var returnObj = {}
            returnObj = {
                'sellingLocation': sellingLocation,
                'fulfillingLoation': fulfillingLoation
            }
            return returnObj;

        }

        const beforeLoad = (context) => {
            var curRec = context.newRecord
            var id = curRec.id;
            log.debug('id',id)
            var type = curRec.type;

            // if (type === 'itemreceipt') {
            //     var subsidiary = curRec.getValue('subsidiary')
            //     log.debug('Subsidiary', subsidiary)
            //     if (subsidiary) {
            //         for (var i = 0; i < curRec.getLineCount('item'); i++) {
            //             var selFulLocation = getDefaultSelFulLocation(subsidiary)
            //             log.debug('fulfillingLoation', selFulLocation.fulfillingLoation)
            //             log.debug('sellingLocation', selFulLocation.sellingLocation)
            //
            //              curRec.setCurrentSublistValue({
            //                 sublistId: 'item',
            //                 fieldId: 'location',
            //
            //                 value: selFulLocation.fulfillingLoation
            //             })
            //             curRec.setSublistValue({
            //                 sublistId: 'item',
            //                 fieldId: 'cseg_sell_location',
            //
            //                 value: selFulLocation.sellingLocation
            //             })
            //         }
            //     }
            // }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
