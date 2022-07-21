/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/search', 'N/email', 'N/url', 'N/runtime'], 
 function(search, email, url, runtime) {
     function onAction(scriptContext){
        log.debug({
            title: 'Start Script'
        });
 
        var objScript = runtime.getCurrentScript();
        var amountTreshold = objScript.getParameter('custscript_kd_amount');
        log.debug('Amount Treshold', amountTreshold);

        var objNewRec = scriptContext.newRecord;
        var lineCount = objNewRec.getLineCount({
            sublistId: 'item'
        });

        var amount, exceedsAmount = 0;
        for(var i = 0; i < lineCount; i++){
            amount = objNewRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: i
            });
            if(amount > amountTreshold){
                exceedsAmount = 1;
                break;
            }
        }

        return exceedsAmount;
     }
 
     return {
         onAction: onAction
     }
 });