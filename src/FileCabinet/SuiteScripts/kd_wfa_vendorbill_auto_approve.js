/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {
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
        const onAction = (context) => {
            var rec = context.newRecord;
            var autoApproveVB = 0;
            var vbAmount = rec.getValue('usertotal')
            var vendorId = rec.getValue('entity')
            log.debug('VB Amount ', vbAmount)
            if(vendorId) {
                var vendorRec = record.load({
                    type: record.Type.VENDOR,
                    id: vendorId,
                    isDynamic: true,
                });

                if (vendorRec) {
                    var enableThresholdBypass = vendorRec.getValue('custentity_kd_enable_threshold_bypass')
                    var bypassThresHoldAmount = vendorRec.getValue('custentity_kd_bypass_threshold_amount')
                    var type = rec.getValue('custbody_kd_po_req_type')
                    log.debug('enableThresholdBypass ', enableThresholdBypass)
                    log.debug('bypassThresHoldAmount ', bypassThresHoldAmount)
                    log.debug('type ', type)

                    if (enableThresholdBypass != true)
                        return
                    if(bypassThresHoldAmount) {
                        if (bypassThresHoldAmount >= vbAmount && type == 6) {// Vendor Type is Utilities

                            autoApproveVB = 1;

                        }
                    }
                }
            }
            log.debug('AutoApproved ', autoApproveVB)
            return autoApproveVB
        }

        return {onAction};
    });
