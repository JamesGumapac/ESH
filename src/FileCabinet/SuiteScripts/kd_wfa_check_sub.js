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
            var isGROUPGBS = 0;
            log.debug({
                title: 'Start Script'
            });
            var GROUPCBS_SUB = [3,65,56,59,40,43,64,41,42,44,46,47,48,45,50,66,51,49,52,54,39,67]

            var newRecord = scriptContext.newRecord;

        }

        return {onAction};
    });
