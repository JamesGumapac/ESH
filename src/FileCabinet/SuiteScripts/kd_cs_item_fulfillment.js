/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
    /**
     * @param{record} record
     * @param{search} search
     */
    function (record, search) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(context) {
            var rec = context.currentRecord;
            console.log('rec',rec)
            rec.setValue({fieldId: 'account', value: 314})
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */


        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(context) {
            var curRec = context.currentRecord
            var sublistName = context.sublistId;
            var fieldName = context.fieldId;
            if(fieldName ==='subsidiary'){
                curRec.setValue({fieldId: 'account', value: 314})
            }
            // && fieldName === "cseg_job_number"
            if (sublistName === 'inventory' && fieldName === "cseg_job_number" ) {
                console.log('Inventory')
                if (fieldName === 'cseg_job_number') {
                    console.log('job number')
                    var job = curRec.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'cseg_job_number_display'
                    });
                    console.log('jobnumber', job)
                }
            }
            if (job) {
                curRec.setValue({fieldId: 'account', value: 466})
            }
        }
        function fieldChanged(context) {
            // var currentRecord = context.currentRecord;
            // var sublistName = context.sublistId;
            // var sublistFieldName = context.fieldId;
            // var line = context.line;
            // if (sublistName === 'inventory' && sublistFieldName === 'cseg_job_number'){
            //     log.debug('fieldChanged', currentRecord.getCurrentSublistValue({
            //         sublistId: sublistName,
            //         fieldId: 'cseg_job_number'
            //     }))
            // }
            var curRec = context.currentRecord
            var sublistName = context.sublistId;
            var fieldName = context.fieldId;
            if(fieldName ==='subsidiary'){
                curRec.setValue({fieldId: 'account', value: 314})
            }
            // && fieldName === "cseg_job_number"
            if (sublistName === 'inventory' && fieldName === "cseg_job_number" ) {
                console.log('Inventory')
                if (fieldName === 'cseg_job_number') {
                    console.log('job number')
                    var job = curRec.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'cseg_job_number_display'
                    });
                    console.log('jobnumber', job)
                }
            }
            if (job) {
                curRec.setValue({fieldId: 'account', value: 466})
            }

        }
        function validateDelete(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            if (sublistName === 'inventory')
                log.debug('test', 'inventory line has been deleted')

            return true;
        }
        function validateLine(context) {
            // var currentRecord = context.currentRecord;
            // var sublistName = context.sublistId;
            // if (sublistName === 'inventory')
            //     log.debug('TEST', currentRecord.getCurrentSublistValue({
            //         sublistId: sublistName,
            //         fieldId: 'cseg_job_number'
            //     }))
            var curRec = context.currentRecord
            var sublistName = context.sublistId;
            var fieldName = context.fieldId;
            if(fieldName ==='subsidiary'){
                curRec.setValue({fieldId: 'account', value: 314})
            }
            // && fieldName === "cseg_job_number"
            if (sublistName === 'inventory' && fieldName === "cseg_job_number" ) {
                console.log('Inventory')
                if (fieldName === 'cseg_job_number') {
                    console.log('job number')
                    var job = curRec.getCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'cseg_job_number_display'
                    });
                    console.log('jobnumber', job)
                }
            }
            if (job) {
                curRec.setValue({fieldId: 'account', value: 466})
            }
            return true;
        }
        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function saveRecord(context) {
            var rec = context.currentRecord;


            for (var i = 0; i < rec.getLineCount('inventory'); i++) {

                var job = rec.getSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'cseg_job_number',
                    line: i

                })

                if(!job){
                    rec.setValue({fieldId: 'account', value: 314})
                }
            }
            return true
        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */


        return {
            pageInit: pageInit,
            postSourcing: postSourcing,
            saveRecord: saveRecord,
            validateLine: validateLine,
            validateDelete: validateDelete,
            fieldChanged: fieldChanged
        };

    });
