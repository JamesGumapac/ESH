/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{serverWidget} serverWidget
     */
    (record, search, serverWidget, url) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (context) => {
            if (context.type === 'edit') {

                function getJobNumber(context) {
                    var objRecord = context.newRecord
                    var jobNumber = []
                    for (var i = 0; i < objRecord.getLineCount({sublistId: 'item'}); i++) {
                        var jobNum = objRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'cseg_job_number_display',
                            line: i
                        });
                        jobNumber.push(jobNum)
                    }
                    log.audit('JobNumber whole', jobNumber)
                    var jobNumberArray = [...new Set(jobNumber)];
                    log.audit('jobnumber trim ', jobNumberArray)
                    return jobNumberArray
                }

                function addRelatedSo(context) {
                    context.form.addTab({
                        id: 'custpage_tab_related_so',
                        label: 'Related SO'
                    });
                    log.debug('addRelatedSo', 'Added Items Related SO tab')

                    var objSublist = context.form.addSublist({
                        id: 'custpage_sublist_related_so',
                        type: serverWidget.SublistType.LIST,
                        label: 'Related SO',
                        tab: 'custpage_tab_related_so'
                    });
                    objSublist.addField({
                        id: 'custpage_view',
                        type: serverWidget.FieldType.TEXT,
                        label: ' '
                    });

                    objSublist.addField({
                        id: 'custpage_col_id',
                        label: 'ID',
                        type: serverWidget.FieldType.TEXT,
                        source: 'salesorder'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_job_number',
                        label: 'Job Number',
                        type: serverWidget.FieldType.TEXT,
                        source: 'item'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_date',
                        label: 'Date',
                        type: serverWidget.FieldType.DATE
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_item',
                        label: 'Item',
                        type: serverWidget.FieldType.SELECT,
                        source: 'item'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_product_code',
                        label: 'Product Code',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_memo',
                        label: 'Memo',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_item_qty',
                        label: 'Quantity',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_item_rate',
                        label: 'Item Rate',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_item_amount',
                        label: 'Item Amount',
                        type: serverWidget.FieldType.CURRENCY
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    objSublist.addField({
                        id: 'custpage_col_status',
                        label: 'Status',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    });
                    var getRelatedSoLines = getRelatedSO(getJobNumber(context))
                    //  var getRelatedSoLine = getJobNumber(context)
                    log.debug('Get Related SO ', getRelatedSoLines)
                    //log.debug('JobNumber List', 'Job Number ID: ' + relatedSoLine);
                    //var netsuiteSiteUrl = getDataCenterURL();
                    if (getRelatedSoLines.length > 0) {
                        for (var i = 0; i < getRelatedSoLines.length; i++) {
                            var domain = url.resolveDomain({
                                hostType: url.HostType.APPLICATION
                            });
                            var editUrl = url.resolveRecord({
                                recordType: record.Type.SALES_ORDER,
                                recordId: getRelatedSoLines[i].tranid
                            });
                            var lineUrl = 'https://' + domain + editUrl;
                            objSublist.setSublistValue({
                                id: 'custpage_view',
                                line: i,
                                value: '<a href="' + lineUrl + '">View</a>'
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_col_job_number',
                                value: getRelatedSoLines[i].jobnumber,
                                line: i
                            });

                            objSublist.setSublistValue({
                                id: 'custpage_col_id',
                                value: getRelatedSoLines[i].id,
                                line: i
                            });

                            objSublist.setSublistValue({
                                id: 'custpage_col_date',
                                value: getRelatedSoLines[i].date,
                                line: i
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_col_item',
                                value: getRelatedSoLines[i].item,
                                line: i
                            });
                            //  log.audit('product code', getRelatedSoLines[i].productCode)
                            objSublist.setSublistValue({
                                id: 'custpage_col_product_code',
                                value: getRelatedSoLines[i].productCode ? getRelatedSoLines[i].productCode : ' ',
                                line: i
                            });

                            objSublist.setSublistValue({
                                id: 'custpage_col_memo',
                                value: getRelatedSoLines[i].memo ? getRelatedSoLines[i].memo : '',
                                line: i
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_col_item_qty',
                                value: getRelatedSoLines[i].qty,
                                line: i
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_col_item_rate',
                                value: getRelatedSoLines[i].itemRate ? getRelatedSoLines[i].itemRate : 0,
                                line: i
                            });


                            objSublist.setSublistValue({
                                id: 'custpage_col_item_amount',
                                value: getRelatedSoLines[i].amount,
                                line: i
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_col_status',
                                value: getRelatedSoLines[i].status,
                                line: i
                            });
                        }
                    }
                }

                function getRelatedSO(jobNumber) {
                    log.audit('Function Get Related SO', jobNumber[0])
                    for (var i = 0; i <= jobNumber.length; i++) {


                        var objSearch = search.create({
                            type: "salesorder",
                            filters:
                                [
                                    ["type", "anyof", "SalesOrd"],
                                    "AND",
                                    ["mainline", "is", "F"],
                                    "AND",
                                    ["cseg_job_number.name", "is", jobNumber[i]]
                                ],
                            columns:
                                [
                                    search.createColumn({name: "internalid", label: "Internal ID"}),
                                    search.createColumn({name: "cseg_job_number", label: "Job Number"}),
                                    search.createColumn({name: "tranid", label: "Document Number"}),
                                    search.createColumn({name: "trandate", label: "Date"}),
                                    search.createColumn({name: "item", label: "Item"}),
                                    search.createColumn({name: "custcol_product_code", label: "Product Code"}),
                                    search.createColumn({name: "memo", label: "Memo"}),
                                    search.createColumn({name: "quantity", label: "Quantity"}),
                                    search.createColumn({name: "fxrate", label: "Item Rate"}),
                                    search.createColumn({name: "amount", label: "Amount"}),
                                    search.createColumn({name: "statusref", label: "Status"})
                                ]
                        });
                        // objSearch.filters.push(search.createFilter({
                        //     name: 'name',
                        //     join: 'cseg_job_number',
                        //     operator: search.Operator.IS,
                        //     values: jobNumber[i]
                        // }));
                        var searchRs = objSearch.run().getRange({start: 0, end: 1000});
                        var relatedSoLines = [];
                        var tranid, jobnumber, documentNumber, date, item, productCode, memo, qty, itemRate, amount,
                            status;
                        log.debug('getRelatedSO', JSON.stringify(searchRs));

                        if (searchRs.length > 0) {
                            for (var i = 0; i < searchRs.length; i++) {
                                tranid = searchRs[i].getValue({
                                    name: 'internalid'
                                });
                                documentNumber = searchRs[i].getValue({
                                    name: 'tranid'
                                });
                                jobnumber = searchRs[i].getText({
                                    name: 'cseg_job_number'
                                });
                                date = searchRs[i].getValue({
                                    name: 'trandate'
                                });

                                item = searchRs[i].getValue({
                                    name: 'item'
                                });
                                productCode = searchRs[i].getValue({
                                    name: 'custcol_product_code'
                                });
                                memo = searchRs[i].getValue({
                                    name: 'memo'
                                });
                                qty = searchRs[i].getValue({
                                    name: 'quantity'
                                });
                                itemRate = searchRs[i].getValue({
                                    name: 'fxrate'
                                });

                                amount = searchRs[i].getValue({
                                    name: 'amount'
                                });

                                status = searchRs[i].getValue({
                                    name: 'statusref'
                                });

                                relatedSoLines.push({
                                    tranid: tranid,
                                    id: documentNumber,
                                    jobnumber: jobnumber,
                                    productCode: productCode,
                                    date: date,
                                    item: item,
                                    memo: memo,
                                    qty: +qty,
                                    itemRate: itemRate,
                                    amount: amount,
                                    status: status
                                });
                            }
                        }

                        log.debug('getRelatedSO', JSON.stringify(relatedSoLines));
                        return relatedSoLines;
                    }
                }

                addRelatedSo(context)
            }
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
