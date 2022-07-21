var SRCH_ITEM_INTERCO_ACCOUNT = 'customsearch_kd_noninv_item_interco_acct';
var SRCH_INTERCO_SO = 'customsearch_kd_interco_so';
var FLD_CUSTOMER_IS_INTERCO = 'custentity_kd_intercompany';
var FLD_LINE_LINK_SO = 'custcol_kd_linking_salesorder';
var CSEG_JOB_NUMBER = 'cseg_job_number';
var REC_JOBNUMBER = 'customrecord_cseg_project_number';
var JOBNUMBER_FLD_SO = 'custrecord4';
var nonInvItems = [];
var itemAmounts = {};
var itemAccounts = {};
var linkedSoIds = [];

function getItemAccounts(items){
    var itemSearch = nlapiLoadSearch('item', SRCH_ITEM_INTERCO_ACCOUNT);
    itemSearch.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', items));
    var searchRs = itemSearch.runSearch();
    searchRs.forEachResult(function(searchResult){
        if(!itemAccounts.hasOwnProperty(searchResult.getValue('internalid'))){
            itemAccounts[searchResult.getValue('internalid')] = {
                income: searchResult.getValue('incomeaccount'),
                expense: searchResult.getValue('expenseaccount'),
                asset: searchResult.getValue('assetaccount'),
                intercompany: searchResult.getValue('custitem_kd_interco_reroute_acct'),
                generateaccruals: searchResult.getValue('generateaccruals')
            };
        }
        return true;         
    });

    nlapiLogExecution('DEBUG', 'getItemAccounts', 'itemAccounts: ' + JSON.stringify(itemAccounts));
    return itemAccounts;
}
function isIntercompanyTransaction(tranRec){
    var isInterco = 'F';
    var recType = tranRec.getRecordType();
    if(recType == 'vendorbill' && tranRec.getFieldValue(CSEG_JOB_NUMBER) != null && tranRec.getFieldValue(CSEG_JOB_NUMBER) != ''){
        var soId = nlapiLookupField(REC_JOBNUMBER, tranRec.getFieldValue(CSEG_JOB_NUMBER), JOBNUMBER_FLD_SO);
        var soCustomer = nlapiLookupField('salesorder', soId, 'entity');
        isInterco = nlapiLookupField('customer', soCustomer, FLD_CUSTOMER_IS_INTERCO);
    }else if(recType == 'itemreceipt'){
        var createdFrom = tranRec.getFieldValue('createdfrom');
        nlapiLogExecution('DEBUG', 'itemreceipt', 'createdfrom: ' + createdFrom);
        if(createdFrom != null && createdFrom != ''){
            var jobNum = nlapiLookupField('purchaseorder', createdFrom, CSEG_JOB_NUMBER);
            nlapiLogExecution('DEBUG', 'itemreceipt', 'jobnum: ' + jobNum);
            if(jobNum != null && jobNum != ''){
                var soId = nlapiLookupField(REC_JOBNUMBER, jobNum, JOBNUMBER_FLD_SO); nlapiLogExecution('DEBUG', 'itemreceipt', 'soId: ' + soId);
                var soCustomer = nlapiLookupField('salesorder', soId, 'entity');
                isInterco = nlapiLookupField('customer', soCustomer, FLD_CUSTOMER_IS_INTERCO);
            }
        }
    }else{
        isInterco = nlapiLookupField('customer', tranRec.getFieldValue('entity'), FLD_CUSTOMER_IS_INTERCO);
    }
    return isInterco;
}
function getItemsAndAmounts(transactionRecord){
    var item, amount;
    for(var i = 1; i <= transactionRecord.getLineItemCount('item'); i++){
        if(transactionRecord.getLineItemValue('item', 'itemtype', i).toUpperCase() == 'NONINVTPART'){
            nonInvItems.push(transactionRecord.getLineItemValue('item', 'item', i));
            item = transactionRecord.getLineItemValue('item', 'item', i);
            amount = transactionRecord.getLineItemValue('item', 'amount', i)
            
            if(itemAmounts[item] == null){
                itemAmounts[item] = amount;
            }else{
                itemAmounts[item] = parseFloat(itemAmounts[item]) + parseFloat(amount);
            }
        }
    }
    nlapiLogExecution('DEBUG', 'getItemsAndAmounts', 'nonInvItems: ' + JSON.stringify(nonInvItems));
    nlapiLogExecution('DEBUG', 'getItemsAndAmounts', 'itemAmounts: ' + JSON.stringify(itemAmounts));
}
function getItemAmounts(transactionRecord, recType, intercoSalesOrders){
    var linkedSo, item, amount;
    for(var i = 1; i <= transactionRecord.getLineItemCount('item'); i++){
        linkedSo = transactionRecord.getLineItemValue('item', FLD_LINE_LINK_SO, i);
        if(transactionRecord.getLineItemValue('item', 'itemtype', i).toUpperCase() == 'NONINVTPART' && linkedSo != '' && intercoSalesOrders.indexOf(linkedSo) >= 0){
            nlapiLogExecution('debug', 'getItemAmounts', 'Adding line to amounts ' + i);
            item = transactionRecord.getLineItemValue('item', 'item', i);
            if(recType == 'itemreceipt' && transactionRecord.getLineItemValue('item', 'generateaccruals', i) == 'T'){
                amount = transactionRecord.getLineItemValue('item', 'itemfxamount', i);
                if(itemAmounts[item] == null){
                    itemAmounts[item] = amount;
                }else{
                    itemAmounts[item] = parseFloat(itemAmounts[item]) + parseFloat(amount);
                }
            }else{
                //if(recType == 'vendorbill' && transactionRecord.getFieldValue('createdfrom') != '' && itemAccounts[item].generateaccruals == 'T')
                if(transactionRecord.getFieldValue('createdfrom') != '' && itemAccounts[item].generateaccruals == 'T')
                    continue;

                //if(itemAccounts[item].generateaccruals == 'F'){
                    amount = transactionRecord.getLineItemValue('item', 'amount', i)
                    if(itemAmounts[item] == null){
                        itemAmounts[item] = amount;
                    }else{
                        itemAmounts[item] = parseFloat(itemAmounts[item]) + parseFloat(amount);
                    }
                //}
            }
        }
    }
}
function getItemsAndLinkedSo(transactionRecord){
    var linkedSo;
    for(var i = 1; i <= transactionRecord.getLineItemCount('item'); i++){
        linkedSo = transactionRecord.getLineItemValue('item', FLD_LINE_LINK_SO, i);
        nlapiLogExecution('debug', 'getItemsAndLinkedSo', i + ' linked SO ' + linkedSo);
        if(transactionRecord.getLineItemValue('item', 'itemtype', i).toUpperCase() == 'NONINVTPART' && linkedSo != ''){
            if(nonInvItems.indexOf(transactionRecord.getLineItemValue('item', 'item', i))){
                nonInvItems.push(transactionRecord.getLineItemValue('item', 'item', i));
            }
            if(linkedSoIds.indexOf(linkedSo) < 0){
                linkedSoIds.push(linkedSo);
            }
        }
    }
}
function getIntercompanySalesOrders(linkedSoIds){
    var soSearch = nlapiLoadSearch('', SRCH_INTERCO_SO);
    soSearch.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', linkedSoIds));
    var searchRs = soSearch.runSearch();
    var intercoSalesOrders = [];
    searchRs.forEachResult(function(searchResult){
        nlapiLogExecution('DEBUG', 'getIntercompanySalesOrders', 'searchRS: ' + searchResult.getValue('internalid'));
        if(intercoSalesOrders.indexOf(searchResult.getValue('internalid')) < 0){
            intercoSalesOrders.push(searchResult.getValue('internalid'));
        }
        return true;         
    });
    nlapiLogExecution('debug', 'getIntercompanySalesOrders', 'intercoSalesOrders: ' + JSON.stringify(intercoSalesOrders));
    return intercoSalesOrders;
}
function customizeGlImpact(transactionRecord, standardLines, customLines, book)
{
    var recType = transactionRecord.getRecordType();

    //var nonInvItems = [], itemAccounts, itemAmounts = {}, item, amount;
    if(recType == 'invoice' || recType == 'creditmemo'){
        var isInterco = isIntercompanyTransaction(transactionRecord);
        nlapiLogExecution('DEBUG', 'customizeGlImpact', 'isInterco: ' + isInterco + '; tranType: ' + transactionRecord.getRecordType());
        if(isInterco == 'T'){
            getItemsAndAmounts(transactionRecord);
            /*for(var i = 1; i <= transactionRecord.getLineItemCount('item'); i++){
                if(transactionRecord.getLineItemValue('item', 'itemtype', i).toUpperCase() == 'NONINVTPART'){
                    nonInvItems.push(transactionRecord.getLineItemValue('item', 'item', i));
                    item = transactionRecord.getLineItemValue('item', 'item', i);
                    amount = transactionRecord.getLineItemValue('item', 'amount', i)
                    
                    if(itemAmounts[item] == null){
                        itemAmounts[item] = amount;
                    }else{
                        itemAmounts[item] = parseFloat(itemAmounts[item]) + parseFloat(amount);
                    }
                }
            }*/
            getItemAccounts(nonInvItems);
        }
    }else{
        
        getItemsAndLinkedSo(transactionRecord);
        /*for(var i = 1; i <= transactionRecord.getLineItemCount('item'); i++){
            linkedSo = transactionRecord.getLineItemValue('item', FLD_LINE_LINK_SO, i);
            nlapiLogExecution('debug', 'test', i + ' linkes SO ' + linkedSo);
            if(transactionRecord.getLineItemValue('item', 'itemtype', i).toUpperCase() == 'NONINVTPART' && linkedSo != ''){
                if(nonInvItems.indexOf(transactionRecord.getLineItemValue('item', 'item', i))){
                    nonInvItems.push(transactionRecord.getLineItemValue('item', 'item', i));
                }
                if(linkedSoIds.indexOf(linkedSo) < 0){
                    linkedSoIds.push(linkedSo);
                }
            }
        }*/
        getItemAccounts(nonInvItems);
        var intercoSalesOrders = getIntercompanySalesOrders(linkedSoIds);
        /*var soSearch = nlapiLoadSearch('', SRCH_INTERCO_SO);
        soSearch.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', linkedSoIds));
        var searchRs = soSearch.runSearch();
        var intercoSalesOrders = [];
        searchRs.forEachResult(function(searchResult){
            nlapiLogExecution('DEBUG', 'getIntercompanySalesOrders', 'searchRS: ' + searchResult.getValue('internalid'));
            if(intercoSalesOrders.indexOf(searchResult.getValue('internalid')) < 0){
                intercoSalesOrders.push(searchResult.getValue('internalid'));
            }
            return true;         
        });
        nlapiLogExecution('debug', 'test', JSON.stringify(intercoSalesOrders));*/

        getItemAmounts(transactionRecord, recType, intercoSalesOrders);
        /*for(var i = 1; i <= transactionRecord.getLineItemCount('item'); i++){
            linkedSo = transactionRecord.getLineItemValue('item', FLD_LINE_LINK_SO, i);
            if(transactionRecord.getLineItemValue('item', 'itemtype', i).toUpperCase() == 'NONINVTPART' && linkedSo != '' && intercoSalesOrders.indexOf(linkedSo) >= 0){
                nlapiLogExecution('debug', 'test', 'adding line to amounts ' + i);
                item = transactionRecord.getLineItemValue('item', 'item', i);
                if(recType == 'itemreceipt' && transactionRecord.getLineItemValue('item', 'generateaccruals', i) == 'T'){
                    amount = transactionRecord.getLineItemValue('item', 'itemfxamount', i);
                    if(itemAmounts[item] == null){
                        itemAmounts[item] = amount;
                    }else{
                        itemAmounts[item] = parseFloat(itemAmounts[item]) + parseFloat(amount);
                    }
                }else{
                    //if(recType == 'vendorbill' && transactionRecord.getFieldValue('createdfrom') != '' && itemAccounts[item].generateaccruals == 'T')
                    if(transactionRecord.getFieldValue('createdfrom') != '' && itemAccounts[item].generateaccruals == 'T')
                        continue;

                    //if(itemAccounts[item].generateaccruals == 'F'){
                        amount = transactionRecord.getLineItemValue('item', 'amount', i)
                        if(itemAmounts[item] == null){
                            itemAmounts[item] = amount;
                        }else{
                            itemAmounts[item] = parseFloat(itemAmounts[item]) + parseFloat(amount);
                        }
                    //}
                }
            }
        }*/
    }

    var amount, debitAcct, creditAcct;
    nlapiLogExecution('DEBUG', 'customGLLines', 'itemAccounts: ' + JSON.stringify(itemAccounts));
    for(var item in itemAmounts){
        nlapiLogExecution('DEBUG', 'customGLLines', 'ADDING custom gl line' + item + '; intercoAcct: ' + itemAccounts[item].intercompany);
        if(itemAccounts[item].intercompany != ""){
            nlapiLogExecution('DEBUG', 'customGLLines', itemAmounts[item] + ' : ' + itemAccounts[item].income + ' : ' + itemAccounts[item].intercompany);
            amount = itemAmounts[item];
            if(recType == 'invoice'){
                debitAcct = parseInt(itemAccounts[item].income);
                creditAcct = parseInt(itemAccounts[item].intercompany);
            }else if(recType == 'creditmemo'){
                debitAcct = parseInt(itemAccounts[item].intercompany);
                creditAcct = parseInt(itemAccounts[item].income);
            }else{
                if(recType == 'itemreceipt' && itemAccounts[item].generateaccruals != 'T')
                    continue;

                if(recType == 'vendorbill' && transactionRecord.getFieldValue('createdfrom') != '' && itemAccounts[item].generateaccruals == 'T')
                    continue;
                
                debitAcct = parseInt(itemAccounts[item].intercompany)
                creditAcct = parseInt(itemAccounts[item].expense)
            }
            
            var newLine = customLines.addNewLine();
            newLine.setDebitAmount(amount);
            newLine.setAccountId(debitAcct);
            newLine.setMemo("custom");

            newLine = customLines.addNewLine();
            newLine.setCreditAmount(amount);
            newLine.setAccountId(creditAcct);
            newLine.setMemo("custom");
            nlapiLogExecution('DEBUG', 'customGLLines', 'added custom gl line');
        }
    }
}