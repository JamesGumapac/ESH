/**
 * @NApiVersion 2.0
 * @NScriptType WorkflowActionScript
 */
define([],
    function() {
        function onAction(scriptContext) {


          var createdFromPO = 0;
                log.debug({
                    title: 'Start Script'
                });
                var newRecord = scriptContext.newRecord;
                var poCount = newRecord.getLineCount({
                    sublistId: 'purchaseorders'
                });
          		   log.debug({
                    title: 'Bill If',
                    details: newRecord.id
                });

                log.debug({
                    title: 'Po Count',
                    details: poCount
                });

                if(poCount > 0)
                {
                    createdFromPO = 1;
                }


                log.debug({
                    title: 'Created from PO',
                    details: createdFromPO
                });

 return parseInt(createdFromPO);
        }
        return {
            onAction: onAction
        }
    });