/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/email', 'N/runtime','N/url','N/redirect'],

    function (record, email, runtime,url,redirect) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            scriptContext.form.removeButton({
                id: 'cancel'
            })

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {
     // Get the value of the Reject reason
            var rejReason = scriptContext.newRecord.getValue({
                fieldId: 'custrecord_kd_reject_reason'	// Change this according to the internal id of the Field Reject Reason in the Custom Record Created
            });

            // Get the ID of the Journal Entry Created reason
            var requisitionId = scriptContext.newRecord.getValue({
                fieldId: 'custrecord_kd_po_requisition'	// Change this according to the internal id of the Field Journal Entry in the Custom Record Created
            });
            var requestor = scriptContext.newRecord.getValue({
                fieldId: 'custrecord_kd_cust_rec_requestor'
            });

            var approval_stage = scriptContext.newRecord.getValue({
                fieldId: 'custrecord_kd_rej_res_app_stage'
            });

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

            var objRecord = record.load({
                type: record.Type.PURCHASE_REQUISITION,
                id: requisitionId,
                isDynamic: true,
            });
            var userObj = runtime.getCurrentUser();
            var userName = userObj.name
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


            // populate the Reject Reason in the Journal Entry field;
                var id = record.submitFields({
                type: record.Type.PURCHASE_REQUISITION,
                id: requisitionId,
                values: {
                    custbody_kd_rejected_reason: rejReason	, // Change custbody1 to the internal id of the custom field Reject Reason in the Journal Entry Record
                   custbodykd_updated_reject_reason : true
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
          var id = scriptContext.newRecord.id
  var rejectRequest = record.delete({
       type: 'customrecord_kd_cust_rec_rej_reason',
       id: id,
    });

            // Get the ID of the Journal Entry Created reason
            var requisitionId = scriptContext.newRecord.getValue({
                fieldId: 'custrecord_kd_po_requisition'	// Change this according to the internal id of the Field Journal Entry in the Custom Record Created
            });
          redirect.toRecord({
  		  type: record.Type.PURCHASE_REQUISITION,
  		  id: requisitionId
}); 
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });