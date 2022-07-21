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

        var objNewRec = scriptContext.newRecord;
        var objOldRec = scriptContext.oldRecord;

        var oldRecLineCount = objOldRec.getLineCount({
            sublistId: 'item'
        });

        var oldRecLineUniqueKeys = [];
        //var oldRecLineNo = [];
        for(var i = 0; i < oldRecLineCount; i++){
            oldRecLineUniqueKeys.push(objOldRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'lineuniquekey',
                line: i
            }));
        }
        log.debug('TEST', JSON.stringify(oldRecLineUniqueKeys));
        var newRecLineCount = objNewRec.getLineCount({
            sublistId: 'item'
        });
        var lineUniqueKey;
        var newLinesTotal = 0;
        var newLineAmount;
        var newLineExceedAmount = false;
        var sendEmail = false;
        for(var i = 0; i < newRecLineCount; i++){
            lineUniqueKey = objNewRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'lineuniquekey',
                line: i
            });
            
            newLineAmount = objNewRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: i
            });
            log.debug('TEST', 'index of' + oldRecLineUniqueKeys.indexOf(lineUniqueKey));
            if(oldRecLineUniqueKeys.indexOf(lineUniqueKey) < 0){
                if(newLineAmount > 50000){
                    sendEmail = true;//return true;
                    log.debug('TEST', 'new item line is found that is greater than 50,000.');
                    break;
                }
                newLinesTotal += newLineAmount;
            }
            /*oldRecLineUniqueKeys.push(objOldRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'lineuniquekey',
                line: i
            }));*/
        }

        if(sendEmail == false && newLinesTotal > 100000){
            log.debug('TEST', 'new lines total is ' + newLinesTotal);
            sendEmail = true;//return true;
        }
        
        if(sendEmail){
            log.debug('TEST', 'to send email');
            var output = url.resolveRecord({
                recordType: 'purchaserequisition',
                recordId: scriptContext.newRecord.id,
                isEditMode: false
            });
            
            //var cfoApprovalRequired = objScript.getParameter('custscript_kd_wa_cfo_apprvl_required');
            var strSubject = 'New Lines on Purchase Requisition ' + scriptContext.newRecord.getValue('tranid');
            var strBody =  'Purchase Requisition <a href="'+ output +'">'+ scriptContext.newRecord.getValue('tranid') +'</a> have new lines added.'

            var empSearch = search.create({
                type: search.Type.EMPLOYEE,
                filters: [{
                    name: 'custentity_kd_issitemanager',
                    operator: search.Operator.IS,
                    values: ['T']
                }],
                columns: [{
                    name: 'internalid'
                }]
            });
    
            var searchRs = empSearch.run();
            var rs = searchRs.getRange(0, 1000);
            if(rs.length > 0){
                var recipients = [];
                for(var i = 0; i < rs.length; i++){
                    recipients.push(rs[i].getValue({name: 'internalid'}));
                }
    
                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: recipients,//rs[0].getValue({name: 'internalid'}),
                    subject: strSubject,
                    body: strBody
                });
            }
        }

        return;
     }
 
     return {
         onAction: onAction
     }
 });