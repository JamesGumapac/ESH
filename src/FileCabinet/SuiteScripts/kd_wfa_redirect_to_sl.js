/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/redirect', 'N/runtime', 'N/url','N/currentRecord'],
    /**
 * @param{redirect} redirect
 * @param{runtime} runtime
 * @param{url} url
 */
    (redirect, runtime, url, currentRecord) => {
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
          var userObj = runtime.getCurrentUser();
          var userName = userObj.name
            var userId = userObj.id
          var tranId = rec.id;
          var requestor = rec.getValue({
            fieldId: 'entity'
          })
          var approval_stage =  rec.getValue({
            fieldId: 'custbody_kd_approval_stage'
          })
          if(!approval_stage){
            approval_stage = 'NONE'
          }
          log.debug('User Id', userId)
          log.debug('rec',tranId)
            redirect.redirect({
                url: '/app/site/hosting/scriptlet.nl?script=819&deploy=1',
                parameters: {
                    'custparam_tranid':tranId,
                    'custparam_userid': userId,
                  	'custparam_requestor': requestor,
                  	'custparam_approvalstage' : approval_stage
                  
                }
            });
        }

        return {onAction};
    });
