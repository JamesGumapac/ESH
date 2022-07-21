/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/redirect'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 */
    (record, redirect) => {
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
            var id = scriptContext.newRecord.id;

            log.debug('Tranid', id)
            if(id){
                redirect.toRecord({
                    type: record.Type.PURCHASE_REQUISITION,
                    id: id,
                    isEditMode: true
                });
                var rec = scriptContext.newRecord;
                rec.setValue({
                    fieldId: 'custbody_kd_rejected_reason',
                    value: 'Rejected'
                })
                var entity = rec.getValue('entity')
                log.debug('entity', entity)
            }
        }

        return {onAction};
    });
