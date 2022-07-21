/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Kodella James Gumapac
 * Date 7/12/2022
 */
define(['N/record', 'N/search', 'N/ui/message'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{search} message
     */
    function (record, search, message) {
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
            console.log('sellingLocation' + sellingLocation)
            console.log('fulfillingLoation' + fulfillingLoation)
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
        function pageInit(context) {
            // var curRec = context.currentRecord
            //
            // var type = curRec.type;
            //
            // if (type === 'itemreceipt') {
            //     var subsidiary = curRec.getValue('subsidiary')
            //     log.debug('Subsidiary', subsidiary)
            //     if (subsidiary) {
            //         for (var i = 0; i < curRec.getLineCount('item'); i++) {
            //             curRec.selectLine({
            //                 sublistId: 'item',
            //                 line: i
            //             });
            //
            //             var selFulLocation = getDefaultSelFulLocation(subsidiary)
            //             log.debug('fulfillingLoation', selFulLocation.fulfillingLoation)
            //             log.debug('sellingLocation', selFulLocation.sellingLocation)
            //
            //              curRec.setSublistValue({
            //                 sublistId: 'item',
            //                 fieldId: 'location',
            //                 line: i,
            //                 value: selFulLocation.fulfillingLoation
            //             })
            //             curRec.setSublistValue({
            //                 sublistId: 'item',
            //                 fieldId: 'cseg_sell_location',
            //                 line: i,
            //                 value: selFulLocation.sellingLocation
            //             })
            //            curRec.commitLine({
            //                 sublistId: 'item'
            //             })
            //         }
            //     }
            // }
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
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var fieldName = context.fieldId;
            var type = currentRecord.type

            try {


                if (type === 'vendorbill' || type === 'vendorcredit') {
                    console.log('Type fieldChange' + type)
                    var subsidiary = currentRecord.getValue('subsidiary')
                    console.log('Subsidiary ' + subsidiary)
                    console.log('SublistName ' + sublistName)
                    if (sublistName === 'item') {
                        console.log('SublistName ' + sublistName)
                        if (fieldName === 'item') {
                            console.log('fieldName ' + fieldName)
                            console.log('entering auto populating of selling and fulfilling location')
                            var selFulLocation = getDefaultSelFulLocation(subsidiary)
                            console.log(selFulLocation.fulfillingLoation)
                            console.log(selFulLocation.sellingLocation)
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                value: selFulLocation.fulfillingLoation
                            })
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'cseg_sell_location_display',
                                value: selFulLocation.sellingLocation
                            })
                        }
                    }
                    if (sublistName === 'expense') {
                        console.log('SublistName ' + sublistName)
                        if (fieldName === 'account') {
                            console.log('fieldName ' + fieldName)
                            console.log('entering auto populating of selling and fulfilling location')
                            var selFulLocation = getDefaultSelFulLocation(subsidiary)
                            console.log(selFulLocation.fulfillingLoation)
                            console.log(selFulLocation.sellingLocation)
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'expense',
                                fieldId: 'location',
                                value: selFulLocation.fulfillingLoation
                            })
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'expense',
                                fieldId: 'cseg_sell_location_display',
                                value: selFulLocation.sellingLocation
                            })
                        }
                    }
                }
            } catch (e) {
                log.error(e.message)
            }
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
            var curRec = context.currentRecord;
            var sublistName = context.sublistId;
            var type = curRec.type;
            console.log('Type ', type)
            if (type === 'vendorbill' || type === 'vendorcredit' || type === 'itemfulfillment' || type === 'check' || type === 'creditcardcharge') {
                console.log('SublistName ' + sublistName)
                if (sublistName == 'item') {

                    var fulfillingLocation = curRec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location'
                    })

                    console.log(fulfillingLocation)
                    if (fulfillingLocation == '') {
                        showErrorMessage(false, true)

                        return false
                    } else {
                        return true;
                    }
                }
                if (sublistName == 'expense') {
                    var fulfillingLocation = curRec.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'location'
                    })

                    console.log(fulfillingLocation)
                    if (fulfillingLocation == '') {
                        showErrorMessage(false, true)

                        return false
                    } else {
                        return true;
                    }
                }

            }

            if (type === 'cashsale' || type === 'invoice' || type === 'creditmemo'|| type === 'cashrefund') {

                if (sublistName == 'item') {
                    var fulfillingLocation = curRec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location'
                    })
                    var sellingLocation = curRec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'cseg_sell_location'
                    })
                    console.log(fulfillingLocation)
                    if (fulfillingLocation == '' || sellingLocation == '') {
                        showErrorMessage(true, true)

                        return false
                    } else {
                        return true;
                    }
                }
                if (sublistName == 'expense') {
                    var fulfillingLocation = curRec.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'location'
                    })
                    var sellingLocation = curRec.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'cseg_sell_location'
                    })
                    console.log(fulfillingLocation)
                    if (fulfillingLocation == '' || sellingLocation == '') {
                        showErrorMessage(true, true)

                        return false
                    } else {
                        return true;
                    }
                }
            }
            return true;
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
        function saveRecord(context) {
            var curRec = context.currentRecord

            var type = curRec.type;
            console.log('Type Save record ' + type)
            if (type === 'vendorbill' || type === 'vendorcredit' || type === 'itemfulfillment' || type === 'check') {
                for (var i = 0; i < curRec.getLineCount('item'); i++) {
                    var fulfillingLocation = curRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: i
                    })

                    console.log(fulfillingLocation)
                    if (fulfillingLocation == '') {
                        showErrorMessage(false, true)

                        return false
                    } else {
                        return true;
                    }
                }
                var expenseCount = curRec.getLineCount('expense')
                if (expenseCount > 0) {
                    for (var i = 0; i < expenseCount; i++) {
                        var fulfillingLocation = curRec.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'location',
                            line: i
                        })

                        console.log(fulfillingLocation)
                        if (fulfillingLocation == '') {
                            showErrorMessage(false, true)

                            return false
                        } else {
                            return true;
                        }
                    }
                }
            }
            if (type === 'customerrefund' || type === 'customerpayment' || type === 'vendorpayment'  || type ==='deposit' ) {
                try {
                    var fulfillingLocaton = curRec.getValue('location')
                    if(fulfillingLocaton == ''){
                        showErrorMessage(false, true)
                        return false
                    }else{
                        return true
                    }
                } catch (e) {
                    log.error(e.message)
                }

            }
            if (type === 'itemreceipt') {
                var createdFrom = curRec.getValue('createdfrom')
                console.log('createdFrom' + createdFrom)

                    for (var i = 0; i < curRec.getLineCount('item'); i++) {
                        var fulfillingLocation = curRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            line: i
                        })

                        console.log(fulfillingLocation)
                        if (fulfillingLocation == '') {
                            showErrorMessage(false, true)

                            return false
                        } else {
                            return true;
                        }

                }

            }
            if (type === 'cashsale' || type === 'invoice' ||  type === 'cashrefund') {

                for (var i = 0; i < curRec.getLineCount('item'); i++) {
                    var fulfillingLocation = curRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: i
                    })
                    var sellingLocation = curRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'cseg_sell_location',
                        line: i
                    })
                    console.log(fulfillingLocation)
                    if (fulfillingLocation == '' || sellingLocation == '') {
                        showErrorMessage(true, true)

                        return false
                    } else {
                        return true;
                    }
                }
                var expenseCount = curRec.getLineCount('expense')
                if (expenseCount > 0) {
                    for (var i = 0; i < expenseCount; i++) {
                        var fulfillingLocation = curRec.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'location',
                            line: i
                        })
                        var sellingLocation = curRec.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'cseg_sell_location',
                            line: i
                        })
                        console.log(fulfillingLocation)
                        if (fulfillingLocation == '' || sellingLocation == '') {
                            showErrorMessage(true, true)

                            return false
                        } else {
                            return true;
                        }
                    }
                }
            }
            return true;
        }

        return {
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // validateField: validateField,
            fieldChanged: fieldChanged,
            validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });
