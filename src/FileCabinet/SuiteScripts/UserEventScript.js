/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/url', 'N/redirect', 'N/ui/serverWidget', 'N/search', 'N/runtime'],
    function(record, url, redirect, serverWidget, search, runtime) {
            var SEA_RETURN_ITEM_RQSTD = 'customsearch_kd_return_item_requested';
            var SCR_ID_GENERATE_FORM_222 = 626;
            var DPLYMNT_GENERATE_FORM_222 = 'customdeploy_kd_sl_generate_form222';
            var FLD_RET_REQ_IT_PROCESSING = 'custcol_kod_rqstprocesing';
            var FLD_RET_REQ_IT_MFG_PROCESSING = 'custcol_kod_mfgprocessing';
            var FLD_RMA_RET_REQ = 'custbody_kd_return_request';
            var FLD_RETREQ_ITEM_MANUFACTURER = 'custcol_kd_item_manufacturer';
            var FLD_RETREQ_ITEM_WHOLESALER = 'custcol_kd_wholesaler';
            var FLD_RETREQ_ITEM_MANUF_CUSTOMER = 'custcol_manuf_customer';
            var FLD_RETREQ_MFG_RETURN = 'custcol_kod_mfgrtn';
            var FLD_RETREQ_CATEGORY = 'custbody_kd_rr_category';
            var FLD_RETREQ_MRR = 'custbody_kd_master_return_id';
            var PROCESSING_DESTRUCTION = 1;
            var PROCESSING_RETURN_FOR_CREDIT = 2;
            var soItemsByManuf = {};
            var soItemsByWhslr = {};
            var hasDestruction = false;
            var hasReturn = false;

            function _getSublistValue(objRec, sublistId, fieldId, line){
                    return objRec.getSublistValue({
                            sublistId: sublistId,
                            fieldId: fieldId,
                            line: line
                    });
            }
            function _setCurrentSublistValue(objRec, sublistId, fieldId, value, ignoreFieldChange){
                    return objRec.setCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: fieldId,
                            value: value,
                            ignoreFieldChange: false
                    });
            }
            function createRma(returnRequestRec){
                    var rmaRec = record.create({
                            type: record.Type.RETURN_AUTHORIZATION,
                            isDynamic: true
                    });

                    rmaRec.setValue('entity', returnRequestRec.getValue('entity'));
                    rmaRec.setValue('orderstatus', 'B');
                    rmaRec.setValue(FLD_RMA_RET_REQ, returnRequestRec.id);
                    rmaRec.setValue('location', returnRequestRec.getValue('location'))

                    var item, qty, rate, amount, processing, priceLevel;
                    var subRecNum, subRecQty, subRecExpDate;
                    for(var i = 0; i < returnRequestRec.getLineCount('item'); i++){
                            item = _getSublistValue(returnRequestRec, 'item', 'item', i);
                            qty = _getSublistValue(returnRequestRec, 'item', 'quantity', i);
                            rate = _getSublistValue(returnRequestRec, 'item', 'rate', i);
                            amount = _getSublistValue(returnRequestRec, 'item', 'amount', i);
                            log.debug('createRma', 'item: ' + item + '; qty: ' + qty + ';rate: ' + rate + '; amount:' + amount);

                            rmaRec.selectNewLine({
                                    sublistId: 'item'
                            });

                            _setCurrentSublistValue(rmaRec, 'item', 'item', item, true);
                            _setCurrentSublistValue(rmaRec, 'item', 'quantity', qty, true);

                            processing = _getSublistValue(returnRequestRec, 'item', FLD_RET_REQ_IT_PROCESSING, i);
                            if(processing == PROCESSING_DESTRUCTION){
                                    //set price level to -1
                                    _setCurrentSublistValue(rmaRec, 'item', 'price', '-1', true);
                                    _setCurrentSublistValue(rmaRec, 'item', 'rate', rate, true);
                                    _setCurrentSublistValue(rmaRec, 'item', 'amount', amount, true);
                                    if(!hasDestruction) hasDestruction = true;
                            }else{
                                    _setCurrentSublistValue(rmaRec, 'item', 'amount', amount, true);
                                    if(!hasReturn) hasReturn = true;
                            }
                            rmaRec.commitLine('item');
                    }

                    var rmaId = rmaRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                    });
                    log.debug('createRma', 'RMA ID: ' + rmaId)

                    updateRmaInvDetail(rmaId, returnRequestRec);

                    return rmaId;
            }
            function updateRmaInvDetail(rmaId, returnRequestRec){
                    var rmaRec = record.load({
                            type: record.Type.RETURN_AUTHORIZATION,
                            id: rmaId,
                            isDynamic: true,
                    });

                    var isNumbered;
                    for(var i = 0; i < rmaRec.getLineCount('item'); i++){
                            rmaRec.selectLine({
                                    sublistId: 'item',
                                    line: i
                            });

                            rmaRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemreceive',
                                    value: true
                            });

                            var returnReqSubrec = returnRequestRec.getSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                    line: i
                            });
                            isNumbered = rmaRec.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'isnumbered'
                            });
                            log.debug('updateRmaInvDetail', 'line ' + i + ' isnumbered ' + isNumbered);
                            if(isNumbered == 'T'){
                                    log.debug('test', 'subrecord line count: ' + returnReqSubrec.getLineCount('inventoryassignment'));
                                    var subrecordCount = returnReqSubrec.getLineCount('inventoryassignment');
                                    var subRec = rmaRec.getCurrentSublistSubrecord({
                                            sublistId: 'item',
                                            fieldId: 'inventorydetail'
                                    });
                                    for(var subrecIndx = 0; subrecIndx < subrecordCount; subrecIndx++){
                                            log.debug('test', 'subrecord invnum: ' + returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'receiptinventorynumber',
                                                    line: subrecIndx}));
                                            log.debug('test', 'subrecord quantity: ' + returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    line: subrecIndx}));
                                            log.debug('test', 'subrecord expirationdate: ' + returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'expirationdate',
                                                    line: subrecIndx}));

                                            subRecNum = returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'receiptinventorynumber',
                                                    line: subrecIndx
                                            });

                                            subRecQty = returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    line: subrecIndx
                                            });

                                            subRecExpDate = returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'expirationdate',
                                                    line: subrecIndx
                                            });

                                            subRec.selectNewLine({
                                                    sublistId: 'inventoryassignment',
                                            });

                                            subRec.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    value: subRecQty
                                            });

                                            subRec.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'receiptinventorynumber',
                                                    value: subRecNum
                                            });

                                            subRec.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'expirationdate',
                                                    value: subRecExpDate
                                            });

                                            subRec.commitLine({
                                                    sublistId: 'inventoryassignment'
                                            });
                                    }

                                    rmaRec.commitLine({
                                            sublistId: 'item'
                                    })
                            }

                    }

                    var rmaId = rmaRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                    });
                    log.debug('update RMA INV DTL', 'RMA ID: ' + rmaId)

            }
            function receiveRma(rmaId, returnRequestRec){
                    var irRec = record.transform({
                            fromType: record.Type.RETURN_AUTHORIZATION,
                            fromId: rmaId,
                            toType: record.Type.ITEM_RECEIPT,
                            isDynamic: true,
                    });

                    for(var i = 0; i < irRec.getLineCount('item'); i++){
                            irRec.selectLine({
                                    sublistId: 'item',
                                    line: i
                            });

                            irRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemreceive',
                                    value: true
                            });

                            irRec.commitLine({
                                    sublistId: 'item'
                            })
                    }

                    irRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                    });
                    log.debug('receiveRma', 'Item Receipt ID: ' + irRec.id);
            }
            function createCreditMemo(rmaId, returnRequestRec){
                    var cmRec = record.transform({
                            fromType: record.Type.RETURN_AUTHORIZATION,
                            fromId: rmaId,
                            toType: record.Type.CREDIT_MEMO,
                            isDynamic: true,
                    });

                    for(var i = 0; i < returnRequestRec.getLineCount('item'); i++){
                            if(_getSublistValue(returnRequestRec, 'item', FLD_RET_REQ_IT_PROCESSING, i) == PROCESSING_DESTRUCTION){
                                    cmRec.selectLine({
                                            sublistId: 'item',
                                            line: i
                                    });

                                    cmRec.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'amount',
                                            value: 0,
                                            ignoreFieldChange: false
                                    });
                                    log.debug('TEST', 'Set line ' + i + ' amount to 0')
                            }
                    }

                    cmRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                    });
                    log.debug('createCreditMemo', 'Credit Memo ID: ' + cmRec.id);
            }
            function createPharmacyInvoice(returnRequestRec){
                    var invcRec = record.create({
                            type: record.Type.INVOICE,
                            isDynamic: true
                    });

                    invcRec.setValue('entity', returnRequestRec.getValue('entity'));
                    //invcRec.setValue('orderstatus', 'B');
                    invcRec.setValue(FLD_RMA_RET_REQ, returnRequestRec.id);
                    invcRec.setValue('location', returnRequestRec.getValue('location'));
                    invcRec.setValue('approvalstatus', '1');
                    log.debug('createPharmacyInvoice', 'invcRec Location: ' + invcRec.getValue('location'));

                    var item, qty, rate, amount, processing, priceLevel;
                    log.debug('createPharmacyInvoice', 'retreqlinecount: ' + returnRequestRec.getLineCount('item'));
                    for(var i = 0; i < returnRequestRec.getLineCount('item'); i++){
                            //processing = _getSublistValue(returnRequestRec, 'item', FLD_RET_REQ_IT_PROCESSING, i);
                            if(_getSublistValue(returnRequestRec, 'item', FLD_RET_REQ_IT_PROCESSING, i) == PROCESSING_DESTRUCTION){
                                    item = _getSublistValue(returnRequestRec, 'item', 'item', i);
                                    qty = _getSublistValue(returnRequestRec, 'item', 'quantity', i);
                                    rate = _getSublistValue(returnRequestRec, 'item', 'rate', i);
                                    amount = _getSublistValue(returnRequestRec, 'item', 'amount', i);
                                    log.debug('createRma', 'item: ' + item + '; qty: ' + qty + ';rate: ' + rate + '; amount:' + amount);

                                    invcRec.selectNewLine({
                                            sublistId: 'item'
                                    });

                                    _setCurrentSublistValue(invcRec, 'item', 'item', item, true);
                                    _setCurrentSublistValue(invcRec, 'item', 'quantity', qty, true);
                                    _setCurrentSublistValue(invcRec, 'item', 'price', '-1', true);
                                    _setCurrentSublistValue(invcRec, 'item', 'rate', rate, true);
                                    _setCurrentSublistValue(invcRec, 'item', 'amount', amount, true);
                                    _setCurrentSublistValue(invcRec, 'item', 'location', invcRec.getValue('location'), true);

                                    log.debug('createPharmacyInvoice', 'item qty: ' + invcRec.getCurrentSublistValue('item', 'quantity'));
                                    //here
                                    var returnReqSubrec = returnRequestRec.getSublistSubrecord({
                                            sublistId: 'item',
                                            fieldId: 'inventorydetail',
                                            line: i
                                    });
                                    log.debug('test', 'subrecord line count: ' + returnReqSubrec.getLineCount('inventoryassignment'));
                                    var subrecordCount = returnReqSubrec.getLineCount('inventoryassignment');
                                    var invSubRec = invcRec.getCurrentSublistSubrecord({
                                            sublistId: 'item',
                                            fieldId: 'inventorydetail'
                                    });
                                    for(var subrecIndx = 0; subrecIndx < subrecordCount; subrecIndx++){
                                            log.debug('test', 'subrecord invnum: ' + returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'numberedrecordid',
                                                    line: subrecIndx}));
                                            log.debug('test', 'subrecord quantity: ' + returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    line: subrecIndx}));
                                            log.debug('test', 'subrecord expirationdate: ' + returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'expirationdate',
                                                    line: subrecIndx}));

                                            subRecNum = returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'numberedrecordid',
                                                    line: subrecIndx
                                            });

                                            subRecQty = returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    line: subrecIndx
                                            });

                                            subRecExpDate = returnReqSubrec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'expirationdate',
                                                    line: subrecIndx
                                            });

                                            invSubRec.selectNewLine({
                                                    sublistId: 'inventoryassignment',
                                            });

                                            invSubRec.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    value: subRecQty
                                            });

                                            invSubRec.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'issueinventorynumber',
                                                    value: subRecNum
                                            });

                                            invSubRec.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'expirationdate',
                                                    value: subRecExpDate
                                            });

                                            invSubRec.commitLine({
                                                    sublistId: 'inventoryassignment'
                                            });
                                    }

                                    invcRec.commitLine('item');
                            }
                    }

                    var invcId = invcRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                    });
                    log.debug('createPharmacyInvoice', 'INVOICE ID: ' + invcId)

                    return invcId;
            }
            function getItemsByManufAndWhslr(returnRequestRec){
                    var rrItems = [], item, quantity, priceLevel, rate, amount, manuf, manufCustomer, whslr, invDetail = [], itemDetails = {};
                    for(var i = 0; i < returnRequestRec.getLineCount('item'); i++){
                            if(returnRequestRec.getSublistValue('item', FLD_RET_REQ_IT_PROCESSING, i) == PROCESSING_RETURN_FOR_CREDIT){
                                    invDetail = [];
                                    item = returnRequestRec.getSublistValue('item', 'item', i);
                                    quantity = returnRequestRec.getSublistValue('item', 'quantity', i);
                                    priceLevel = returnRequestRec.getSublistValue('item', 'price', i);
                                    rate = returnRequestRec.getSublistValue('item', 'rate', i);
                                    amount = returnRequestRec.getSublistValue('item', 'amount', i);

                                    retReqSubRec = returnRequestRec.getSublistSubrecord({
                                            sublistId: 'item',
                                            fieldId: 'inventorydetail',
                                            line: i
                                    });

                                    var subRecNum, subRecQty, subRecExpDate;
                                    for(var subrecIndx = 0; subrecIndx < retReqSubRec.getLineCount('inventoryassignment'); subrecIndx++){
                                            subRecNum = retReqSubRec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'numberedrecordid',//'receiptinventorynumber',
                                                    line: subrecIndx
                                            });

                                            subRecQty = retReqSubRec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    line: subrecIndx
                                            });

                                            subRecExpDate = retReqSubRec.getSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'expirationdate',
                                                    line: subrecIndx
                                            });

                                            invDetail.push({invnum: subRecNum, quantity: subRecQty, expdate: subRecExpDate});
                                    }

                                    itemDetails = {
                                            item: item,
                                            quantity: quantity,
                                            pricelevel: priceLevel,
                                            rate: rate,
                                            amount: amount,
                                            inventorydetail: invDetail
                                    };
                                    log.debug('getItemsByManufAndWhslr', 'is manufItems: ' + returnRequestRec.getSublistValue('item', FLD_RETREQ_MFG_RETURN, i));
                                    log.debug('getItemsByManufAndWhslr', 'manuf customer: ' + returnRequestRec.getSublistValue('item', FLD_RETREQ_ITEM_MANUF_CUSTOMER, i));
                                    if(!returnRequestRec.getSublistValue('item', FLD_RETREQ_MFG_RETURN, i)){
                                            whslr = returnRequestRec.getSublistValue('item', FLD_RETREQ_ITEM_WHOLESALER, i);
                                            if(!soItemsByWhslr.hasOwnProperty(whslr)){
                                                    soItemsByWhslr[whslr] = [];
                                            }
                                            soItemsByWhslr[whslr].push(itemDetails);
                                    }else{
                                            manuf = returnRequestRec.getSublistValue('item', FLD_RETREQ_ITEM_MANUFACTURER, i);
                                            manufCustomer = returnRequestRec.getSublistValue('item', FLD_RETREQ_ITEM_MANUF_CUSTOMER, i);
                                            if(!soItemsByManuf.hasOwnProperty(manufCustomer)){
                                                    soItemsByManuf[manufCustomer] = [];
                                            }
                                            soItemsByManuf[manufCustomer].push(itemDetails);
                                    }
                            }
                    }
                    log.debug('getItemsByManufAndWhslr', 'manufItems: ' + JSON.stringify(soItemsByManuf));
                    log.debug('getItemsByManufAndWhslr', 'whslrItems: ' + JSON.stringify(soItemsByWhslr));
            }
            function createSalesOrder(manuf, soItems, returnRequestRec){
                    var soRec = record.create({
                            type: record.Type.SALES_ORDER,
                            isDynamic: true
                    });

                    soRec.setValue('entity', manuf);
                    soRec.setValue('orderstatus', 'B');
                    soRec.setValue(FLD_RMA_RET_REQ, returnRequestRec.id);
                    soRec.setValue('location', returnRequestRec.getValue('location'));

                    var item, qty, priceLevel, rate, amount, invDtl, invDtlNum, invDtlQty, invDtlExpData;
                    for(var i = 0; i < soItems.length; i++){
                            item = soItems[i].item;
                            qty = soItems[i].quantity;
                            priceLevel = soItems[i].pricelevel;
                            rate = soItems[i].rate;
                            amount = soItems[i].amount;
                            invDtl = soItems[i].inventorydetail;

                            soRec.selectNewLine('item');
                            _setCurrentSublistValue(soRec, 'item', 'item', item, false);
                            _setCurrentSublistValue(soRec, 'item', 'quantity', qty, false);
                            _setCurrentSublistValue(soRec, 'item', 'price', priceLevel, false);
                            _setCurrentSublistValue(soRec, 'item', 'rate', rate, false);
                            _setCurrentSublistValue(soRec, 'item', 'amount', amount, false);

                            soRec.commitLine('item');
                    }

                    return(soRec.save());
            }
            function updateSoInventoryDetail(soId, soItems){
                    var soRec = record.load({
                            type: record.Type.SALES_ORDER,
                            id: soId,
                            isDynamic: true,
                    });

                    var isNumbered;
                    var invDtl, invDtlNum, invDtlQty, invDtlExpDate;
                    for(var i = 0; i < soRec.getLineCount('item'); i++){
                            soRec.selectLine({
                                    sublistId: 'item',
                                    line: i
                            });

                            var subRec = soRec.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail'
                            });

                            invDtl = soItems[i].inventorydetail;
                            log.debug('TEST', JSON.stringify(invDtl));
                            for(var j = 0; j < invDtl.length; j++){

                                    invDtlNum = invDtl[j].invnum;
                                    invDtlQty = invDtl[j].quantity;
                                    invDtlExpDate = invDtl[j].expdate;
                                    log.debug('TEST', 'invDetail num: '+invDtlNum+'; qty: ' + invDtlQty + '; expdate: ' + invDtlExpDate)
                                    subRec.selectNewLine({
                                            sublistId: 'inventoryassignment',
                                    });

                                    subRec.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'quantity',
                                            value: invDtlQty
                                    });

                                    subRec.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'issueinventorynumber',
                                            value: invDtlNum
                                    });

                                    subRec.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'expirationdate',
                                            value: invDtlExpDate
                                    });

                                    subRec.commitLine({
                                            sublistId: 'inventoryassignment'
                                    });
                            }

                            soRec.commitLine({
                                    sublistId: 'item'
                            });
                    }

                    var soId = soRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                    });
                    log.debug('update SO INV DTL', 'SO ID: ' + soId)
            }
            function createManufAndWhslSalesOrder(returnRequestRec){
                    var soId;
                    for(var manuf in soItemsByManuf){
                            soId = createSalesOrder(manuf, soItemsByManuf[manuf], returnRequestRec);
                            updateSoInventoryDetail(soId, soItemsByManuf[manuf]);
                            log.debug('createManufAndWhslSalesOrder', 'manuf ' + manuf + ' SO ' + soId);
                    }

                    for(var whslr in soItemsByWhslr){
                            soId = createSalesOrder(whslr, soItemsByWhslr[whslr], returnRequestRec);
                            updateSoInventoryDetail(soId, soItemsByWhslr[whslr]);
                            log.debug('createManufAndWhslSalesOrder', 'whslr ' + whslr + ' SO ' + soId);
                    }
            }
            function afterSubmit(context) {
                    log.debug('test', 'USER: ' + runtime.getCurrentUser().id);
                    if (context.type == context.UserEventType.CREATE)
                            return;
                    var returnRequestOldRec = context.oldRecord;
                    var returnRequestRec = context.newRecord;
                    //log.debug('createRma', 'new status: ' + returnRequestRec.getValue('transtatus'))
                    //log.debug('createRma', 'old status: ' + returnRequestOldRec.getValue('transtatus'))
                    //log.debug('createRma', 'status: ' + returnRequestRec.getText('transtatus').toUpperCase())
                    if(returnRequestRec.getValue('transtatus') != returnRequestOldRec.getValue('transtatus') && returnRequestRec.getText('transtatus').toUpperCase() == 'PROCESSED/PENDING APPROVAL'){
                            //create pharmacy invoice
                            //create manufacturing sales order
                            //create wholesale sales order
                            var rmaId = createRma(returnRequestRec);
                            receiveRma(rmaId, returnRequestRec);
                            //createCreditMemo(rmaId, returnRequestRec);
                            //get items for manuf and for wholesale SO
                            getItemsByManufAndWhslr(returnRequestRec);
                            createManufAndWhslSalesOrder(returnRequestRec);
                            createPharmacyInvoice(returnRequestRec);
                    }else if(returnRequestRec.getValue(FLD_RETREQ_CATEGORY) == '3' && returnRequestRec.getText('transtatus').toUpperCase() == 'AUTHORIZED' && runtime.getCurrentUser().id == '319'){
                            /*else if(returnRequestRec.getValue(FLD_RETREQ_CATEGORY) == '3' && returnRequestRec.getValue('transtatus') != returnRequestOldRec.getValue('transtatus') && returnRequestRec.getText('transtatus').toUpperCase() == 'AUTHORIZED'){*/
                            //var createPDFURL = nlapiResolveURL('SUITELET', 'customscript325', 'customdeploy1', false);
                            var generatePdfUrl = url.resolveScript({
                                    scriptId: SCR_ID_GENERATE_FORM_222,
                                    deploymentId: DPLYMNT_GENERATE_FORM_222/*,
                returnExternalUrl: true*/
                            });
                            /*redirect.toSuitelet({
                                scriptId: SCR_ID_GENERATE_FORM_222,
                                deploymentId: '876'
                            });*/
                            //newWindow = window.open(generatePdfUrl);
                            log.debug('afterSubmit', 'authorized: ' + generatePdfUrl+'id='+context.newRecord.id);
                            redirect.redirect({
                                    url: generatePdfUrl+'&id='+context.newRecord.id/*,
                parameters: {
                    'id': context.newRecord.id
                }*/
                            });
                            //pass the internal id of the current record  createPDFURL += '&id=' + nlapiGetRecordId();
                            //show the PDF file   newWindow = window.open(createPDFURL);}
                    }
            }
            function getItemsRequested(mrrId){
                    var searchRs = search.load({
                            id: SEA_RETURN_ITEM_RQSTD,
                            filters: search.createFilter({
                                    name: 'custrecord_kd_rir_masterid',
                                    operator: search.Operator.ANYOF,
                                    values: mrrId
                            })
                    }).run().getRange({ start: 0, end: 1000 });
                    var itemsRequested = [];
                    var rirId, item, itemDesc, itemNdc;
                    for(var i=0; i < searchRs.length; i++){
                            rirId = searchRs[i].getValue({
                                    name: 'id'
                            });
                            item = searchRs[i].getValue({
                                    name: 'custrecord_kd_rir_item'
                            });
                            itemDesc = searchRs[i].getValue({
                                    name: 'salesdescription',
                                    join: 'custrecord_kd_rir_item'
                            });
                            if(itemDesc == ''){
                                    itemDesc = searchRs[i].getText({
                                            name: 'custrecord_kd_rir_item'
                                    });
                            }
                            itemNdc = searchRs[i].getValue({
                                    name: 'custitem_kod_item_ndc',
                                    join: 'custrecord_kd_rir_item'
                            });

                            itemsRequested.push({
                                    id: rirId,
                                    item: item,
                                    desc: itemDesc,
                                    ndc: itemNdc
                            });
                    }

                    log.debug('test', JSON.stringify(itemsRequested));
                    return itemsRequested;
            }
            function beforeLoad(context){
                    context.form.addTab({
                            id:'custpage_tab_items_requested',
                            label:'Items Requested'
                    });
                    log.debug('beforeLoad', 'Added Items Requested tab')

                    var objSublist = context.form.addSublist( {
                            id: 'custpage_sublist_items_requested',
                            type:serverWidget.SublistType.LIST,
                            label: 'Items Requested',
                            tab:'custpage_tab_items_requested'
                    });
                    objSublist.addField({
                            id:'custpage_col_id',
                            label:'ID',
                            type: serverWidget.FieldType.SELECT,
                            source: 'customrecord_kod_mr_item_request'
                    });
                    objSublist.addField({
                            id:'custpage_col_item',
                            label:'Item',
                            type: serverWidget.FieldType.SELECT,
                            source: 'item'
                    });
                    objSublist.addField({
                            id: 'custpage_col_item_description',
                            label: 'Item Description',
                            type: serverWidget.FieldType.TEXT
                    });
                    objSublist.addField({
                            id:'custpage_col_item_ndc',
                            label:'Item NDC',
                            type: serverWidget.FieldType.TEXT
                    });

                    var itemsRequested = getItemsRequested(context.newRecord.getValue(FLD_RETREQ_MRR));
                    log.debug('test', 'return request id: ' + context.newRecord.getValue(FLD_RETREQ_MRR));
                    for(var i=0; i < itemsRequested.length; i++){
                            objSublist.setSublistValue({
                                    id: 'custpage_col_id',
                                    value: itemsRequested[i].id,
                                    line: i
                            });
                            objSublist.setSublistValue({
                                    id: 'custpage_col_item',
                                    value: itemsRequested[i].item,
                                    line: i
                            });
                            objSublist.setSublistValue({
                                    id: 'custpage_col_item_description',
                                    value: itemsRequested[i].desc,
                                    line: i
                            });
                            objSublist.setSublistValue({
                                    id: 'custpage_col_item_ndc',
                                    value: itemsRequested[i].ndc,
                                    line: i
                            });
                    }
                    objSublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
                    /*objSublist.setSublistValue({
                        id:'custpage_col_id',
                        value:'1',
                        line: 0
                    });
                    objSublist.setSublistValue({
                        id:'custpage_col_item',
                        value:'417',
                        line: 0
                    });*/
            }
            return {
                    afterSubmit: afterSubmit,
                    beforeLoad: beforeLoad
            };
    });