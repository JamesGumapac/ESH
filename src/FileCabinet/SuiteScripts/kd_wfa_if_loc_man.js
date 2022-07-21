/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/currentRecord'],
    /**
 * @param{currentRecord} currentRecord
 */
    (currentRecord) => {
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
            var record = scriptContext.newRecord;
            var lineCount = record.getLineCount('item')

            var isLocation = 0;

            for (var i = 0; i <lineCount; i++) {
                var location = record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    line: i
                })
                log.debug(`Location for line ${i} : ${location}`)
                if(!location){
                    isLocation += 1;
                }

            }
            return isLocation;
        }

        return {onAction};
    });
