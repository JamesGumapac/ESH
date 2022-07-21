/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define([],
    
    () => {
        /**
         * Defines the WorkflowAction script trigger point.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
         * @param {string} scriptContext.type - Event type
         * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
         * @since 2016.1
         */
        const onAction = (scriptContext) => {
        

	 var rec = scriptContext.newRecord;
          var lineamount = 0;
          var total = rec.getValue('custbody_sas_journal_total');
            var linecount = rec.getLineCount({
                sublistId: 'line'
            });

              if (linecount > 0) {
				
                for (var i = 0; i < linecount; ++i) {
                    log.debug({title: 'Line ', details: i})
                     lineamount = rec.getSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        line: i
                    }) || rec.getSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        line: i
                    })
                      
                  log.debug('Line Amount', lineamount)
                    if(lineamount > 5000 || total > 10000){
                     rec.setValue('custbody_fnncl_mngmnt_appvr',true)
                      log.debug('lineamount is greater than 5k ', lineamount)
                        break;
                    }else{
                      rec.setValue('custbody_fnncl_mngmnt_appvr',false)
                    }
                 
                  
                }
                log.debug('total is ', total)
				
              }
                
              


            }

        

        return {onAction};
    });
