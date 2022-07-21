/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {
        /**
         *
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
            var record = scriptContext.newRecord;
            log.debug({title: 'record', details: record})
            record.setValue({
                fieldId: 'orderstatus',
                value: 'B'
            })
        }

        return {onAction};
    });
