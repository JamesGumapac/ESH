/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record'],
    /**
 * @param{search} search
 */
    (search,record) => {
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
            var soRec = context.newRecord;
            log.debug('record' , soRec)
            if(soRec){
                var id = context.newRecord.id;
                log.debug('So Id ' ,id)
                var soTotal = soRec.getValue({
                    fieldId: 'total'
                })
                log.debug('So Total ', soTotal)
                var invoiceTotal = 0;
                var remainingTotal = 0;

                if(id){
                    var invoiceSearchObj = search.create({
                        type: "invoice",
                        filters:
                            [
                                ["type","anyof","CustInvc"],
                                "AND",
                                ["createdfrom","anyof",id],
                                "AND",
                                ["mainline","is","T"]
                            ],
                        columns:
                            [
                                search.createColumn({name: "amount", label: "Amount"})

                            ]
                    });
                    var searchResultCount = invoiceSearchObj.runPaged().count;
                    log.debug("invoiceSearchObj result count",searchResultCount);
                    invoiceSearchObj.run().each(function(result){
                        var amt = parseFloat(result.getValue('amount'))
                        log.debug('Amount ' , amt)
                        invoiceTotal = invoiceTotal + amt;
                        log.debug('total is ' , invoiceTotal)
                        return true;
                    });

                    remainingTotal = soTotal - invoiceTotal;
                    log.debug('Remaining Total ' , remainingTotal)



                    record.submitFields({
                        type: 'salesorder',
                        id: id,
                        values: {
                            custbody_kd_remaining_balance: remainingTotal
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });
                }




            }

        }

        return { afterSubmit}

    });
