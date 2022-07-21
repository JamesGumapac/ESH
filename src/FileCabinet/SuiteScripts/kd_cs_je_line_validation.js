/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record','N/ui/message'],
    /**
     * @param{runtime} runtime
     * @param{runtime} record
     * @param{runtime} message
     */
    function (runtime, record,message) {
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

        function showErrorMessage(selling, fulfilling) {
            if (selling === true && fulfilling === true) {
                var errorMessage = message.create({
                    title: 'ERROR',
                    message: 'SELLING AND FULFILLING LOCATION IS REQUIRED',
                    type: message.Type.ERROR,

                });
                errorMessage.show()
            }
            if (selling === true && fulfilling === false) {
                var errorMessage = message.create({
                    title: 'ERROR',
                    message: 'SELLING LOCATION IS REQUIRED',
                    type: message.Type.ERROR
                });
                errorMessage.show()
            }
            if (fulfilling === true && selling === false) {
                var errorMessage = message.create({
                    title: 'ERROR',
                    message: 'FULFILLING LOCATION IS REQUIRED',
                    type: message.Type.ERROR
                });
                errorMessage.show()
            }
        }

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

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
        function fieldChanged(context) {


        }

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
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

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
        function lineInit(context) {
            // var currentRecord = context.currentRecord;
            // var account = currentRecord.getCurrentSublistText({
            //     sublistId: "line",
            //     fieldId: "account"
            // })
            // var subsidiary = currentRecord.getValue('subsidiary')
            // var accountFirstDigit = account.charAt(0)
            // if (parseInt(accountFirstDigit) < 4 && parseInt(accountFirstDigit) > 0) {
            //     var selFulLocation = getDefaultSelFulLocation(subsidiary)
            //     currentRecord.setCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'location',
            //
            //         value: selFulLocation.fulfillingLoation
            //     })
            //     currentRecord.setCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'cseg_sell_location',
            //
            //         value: selFulLocation.sellingLocation
            //     })
            // }
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
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(context) {
            var user = runtime.getCurrentUser()
            var role = user.role;
            console.log('Role ' + role)
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var itemCount = currentRecord.getLineCount("line");
            if (role != 1063) {

                var sellingLocation = currentRecord.getCurrentSublistValue({
                    sublistId: "line",
                    fieldId: "cseg_sell_location"
                })
                console.log(sellingLocation)
                var fulfillingLocation = currentRecord.getCurrentSublistValue({
                    sublistId: "line",
                    fieldId: "location"
                })
                console.log(fulfillingLocation)
                var account = currentRecord.getCurrentSublistText({
                    sublistId: "line",
                    fieldId: "account"
                })

                var accountFirstDigit = account.charAt(0)
                console.log(account.charAt(0))
                if (account.charAt(0) == '4') {
                    if (fulfillingLocation == '' || sellingLocation == '') {
                        showErrorMessage(true, true)
                        return false

                    }
                }
                if (parseInt(accountFirstDigit) != 4 ) {
                    if (fulfillingLocation == '') {
                        showErrorMessage(false, true)
                        return false;
                    }
                }


            }

            return true
        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

        }

        return {
            // pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            lineInit: lineInit,
            // validateField: validateField,
            validateLine: validateLine
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord
        };

    })
;
