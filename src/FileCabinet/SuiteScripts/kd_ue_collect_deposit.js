/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {
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
        const beforeSubmit = (scriptContext) => {
            var objRecord = scriptContext.newRecord;
            log.debug('Record', objRecord)
            var COLLECT_DEPOST = 'custbody_kd_collect_deposit'

            var lineCount = objRecord.getLineCount({
                sublistId: 'item'
            })
            for (var i = 0; i < lineCount; i++) {
               var item = objRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
               log.debug(`item line ${i}  item ${item}`)
               if(item == 2244){
                   log.debug('Enter Item Condition ')
                   objRecord.setValue({
                       fieldId: COLLECT_DEPOST,
                       value: true
                   })
                   break;
               }else{
                   log.debug('Enter Item Condition ')
                   objRecord.setValue({
                       fieldId: COLLECT_DEPOST,
                       value: false
                   })
               }
            }
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
