/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect', 'N/search', 'N/ui/message', 'N/ui/serverWidget', 'N/url', 'N/ui/dialog', 'N/email', 'N/runtime'],
    /**
     * @param {record} record
     * @param {redirect} redirect
     * @param {search} search
     * @param {message} message
     * @param {serverWidget} serverWidget
     * @param {url} url
     * @param {dialog} dialog
     */
    function (record, redirect, search, message, widget, url, dialog, email, runtime) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            if (context.request.method == 'GET') {

                var form = widget.createForm({
                    title: 'Rejected Reason'
                })
                var req = context.request;
                var id = req.parameters.custparam_tranid;
                var userId = req.parameters.custparam_userid;
                log.debug('Onload ', userId)
                var requestor = req.parameters.custparam_requestor;
                var approval_stage = req.parameters.custparam_approvalstage;

                var tranId = form.addField({
                    id: 'custpage_tranid',
                    label: 'TRANSACTION ID',
                    type: widget.FieldType.TEXT
                })

                var _approvalstage = form.addField({
                    id: 'custpage_approvalstage',
                    label: 'Approval Stage',
                    type: widget.FieldType.TEXT
                })
                _approvalstage.defaultValue = approval_stage;
                _approvalstage.updateDisplayType({
                    displayType: widget.FieldDisplayType.HIDDEN
                })

                var _userId = form.addField({
                    id: 'custpage_userid',
                    label: 'User Id',
                    type: widget.FieldType.TEXT
                })
                _userId.defaultValue = userId;
                _userId.updateDisplayType({
                    displayType: widget.FieldDisplayType.HIDDEN
                })

                var _requestor = form.addField({
                    id: 'custpage_requestor',
                    label: 'User Id',
                    type: widget.FieldType.TEXT
                })
                _requestor.defaultValue = requestor;
                _requestor.updateDisplayType({
                    displayType: widget.FieldDisplayType.HIDDEN
                })

                var rejectReason = form.addField({
                    id: 'custpage_rej_reason',
                    label: 'REJECT REASON',
                    type: widget.FieldType.LONGTEXT
                })
                rejectReason.isMandatory = true;
                tranId.defaultValue = id;
                tranId.updateDisplayType({
                    displayType: widget.FieldDisplayType.INLINE
                });
                form.addSubmitButton({
                    label: 'Submit'
                });

                context.response.writePage(form)
            } else {
                var req = context.request;
                var rejectreason = req.parameters.custpage_rej_reason
                var id = req.parameters.custpage_tranid;
                var approval_stage = req.parameters.custpage_approvalstage
                var userId = req.parameters.custpage_userid;
                var requestor = req.parameters.custpage_requestor;
                log.debug('Rejected Reason', rejectreason)
                log.debug('userId ', userId)
                log.debug('requestor ', requestor)

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
                    id: id,
                    isDynamic: true,
                });
                log.debug('Object Record ', objRecord)
                var poReq = record.submitFields({
                    type: record.Type.PURCHASE_REQUISITION,
                    id: id,
                    values: {
                        custbody_kd_rejected_reason: rejectreason
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
                var userObj = runtime.getCurrentUser();
                var userName = userObj.name
                var output = url.resolveRecord({
                    recordType: record.Type.PURCHASE_REQUISITION,
                    recordId: id,
                    isEditMode: false
                });
                strSubject = 'Purchase Requisition ' + objRecord.getValue('tranid') + ' is Rejected by ' + userName,
                    strBody = 'Purchase Requisition <a href="' + output + '">' + objRecord.getValue('tranid') + '</a> is Rejected by ' + userName + ' ' + approval_stage

                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: requestor,
                    subject: strSubject,
                    body: strBody
                });


                redirect.toRecord({
                    type: record.Type.PURCHASE_REQUISITION,
                    id: id
                });

                //context.response.writePage(form1);


            }
        }

        return {
            onRequest: onRequest
        };

    });
