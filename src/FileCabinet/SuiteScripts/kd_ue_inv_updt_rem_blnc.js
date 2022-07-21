/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/task', 'N/search'],
    /**
     * @param{record} record
     * @param{task} task
     * @param{search} search
     */
    (record, task, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */

        const afterSubmit = (context) => {
            // const mapReduceScriptId = 'customscript_kd_mr_update_rem_bal';
            //
            // // Create a map/reduce task
            // //
            // // Update the deploymentId parameter to use the script ID of
            // // the deployment record for your map/reduce script
            // let mrTask = task.create({
            //     taskType: task.TaskType.MAP_REDUCE,
            //     scriptId: mapReduceScriptId,
            //     deploymentId: 'customdeploy_kd_mr_update_rem_bal'
            // });
            //
            // // Submit the map/reduce task
            // let mrTaskId = mrTask.submit();
            var newRec = context.newRecord;

            var relatedSo = newRec.getValue('createdfrom')
            log.debug('related SO', relatedSo)
            if (relatedSo) {
                var remainingBalance = 0;
                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters:
                        [
                            ["type", "anyof", "CustInvc"],
                            "AND",
                            ["createdfrom", "anyof", relatedSo],
                            "AND",
                            ["mainline","is","T"]

                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "amount",
                                summary: "SUM",
                                label: "Amount"
                            })
                        ]
                });
                var searchResultCount = invoiceSearchObj.runPaged().count;
                log.debug("invoiceSearchObj result count", searchResultCount);
                invoiceSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    remainingBalance = result.getValue({
                        name: "amount",
                        summary: "SUM"
                    })
                    log.debug('remaining balance', remainingBalance)
                    return true;
                });
                var soRec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: relatedSo,
                    isDynamic: true
                })
                var soTotal = 0
                soTotal = soRec.getValue('total')
                var remainingAmountTotal = 0
                remainingAmountTotal = soTotal - remainingBalance
                soRec.setValue({fieldId: 'custbody_kd_remaining_balance', value: remainingAmountTotal})
                var soId = soRec.save({
                    ignoreMandatoryFields: true
                })

            }


        }

        return {afterSubmit}

    });
