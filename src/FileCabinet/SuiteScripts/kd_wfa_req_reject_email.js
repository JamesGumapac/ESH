/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/email', 'N/runtime','N/url','N/redirect'],
    /**
 * @param{currentRecord} currentRecord
 * @param{email} email
 * @param{record} record
 */
    (record, email, runtime,url,redirect) => {
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
            var requisitionId = scriptContext.newRecord.id;
            var objRecord = scriptContext.newRecord;
            log.debug({title: 'objRecord', details: objRecord})
            var approval_stage = objRecord.getValue({
                fieldId: 'custbody_kd_approval_stage'
            });

            log.debug({title: 'approval_stage', details: approval_stage})
            var rejReason = objRecord.getValue({
                fieldId: 'custbody_kd_rejected_reason'
            })



            log.debug({title: 'requisitionId', details: requisitionId})

            var requestor = objRecord.getValue({
                fieldId: 'entity'
            });
            log.debug({title: 'requestor', details: requestor})
            var userObj = runtime.getCurrentUser();
            var userName = userObj.name


            switch (approval_stage) {
                case 'OL':
                    approval_stage = " at Ops Lead Approval Stage"
                    break;
                case 'SM':
                    approval_stage = " at Site Manager Approval Stage"
                    break;
                case 'DH':
                    approval_stage = " at Division Head Approval Stage"
                    break;
                case 'FM':
                    approval_stage = " at Division Head Approval Stage"
                    break;
                default:
                    approval_stage = ""
            }
            log.debug('Approval Stage', approval_stage)
            var output = url.resolveRecord({
                recordType: record.Type.PURCHASE_REQUISITION,
                recordId: requisitionId,
                isEditMode: false
            });
            strSubject = 'Purchase Requisition ' + objRecord.getValue('tranid') + ' was REJECTED.'
            strBody = 'Purchase Requisition <a href="' + output + '">' +objRecord.getValue('tranid') + '</a> was REJECTED by ' + userName + ' ' + approval_stage +'\n' + ' with Reject Reason: ' +rejReason

            email.send({
                author: runtime.getCurrentUser().id,
                recipients: requestor,
                subject: strSubject,
                body: strBody
            });

        }

        return {onAction};
    });
