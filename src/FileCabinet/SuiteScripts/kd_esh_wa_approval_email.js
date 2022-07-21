/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/search', 'N/email', 'N/url', 'N/runtime'], 
function(search, email, url, runtime) {
    function onAction(scriptContext){
        log.debug({
            title: 'Start Script'
        });



        var objScript = runtime.getCurrentScript();
        var strType = scriptContext.newRecord.type;//objScript.getParameter('custscript_kd_wa_email_approval_type');
        var strSubject = '';
        var strBody = '';
         
        switch(strType) {
            case 'customer':
                var output = url.resolveRecord({
                    recordType: 'customer',
                    recordId: scriptContext.newRecord.id,
                    isEditMode: false
                });

                strSubject = 'New Customer ' + scriptContext.newRecord.getValue('entityid') + ' for Approval',
                strBody =  'Customer <a href="'+ output +'">'+ scriptContext.newRecord.getValue('entityid') +'</a> is waiting for approval.'
                break;
            case 'vendor':
                var output = url.resolveRecord({
                    recordType: 'vendor',
                    recordId: scriptContext.newRecord.id,
                    isEditMode: false
                });

                strSubject = 'New Vendor ' + scriptContext.newRecord.getValue('altname') + ' for Approval',
                strBody =  'Vendor <a href="'+ output +'">'+ scriptContext.newRecord.getValue('altname') +'</a> is waiting for approval.'
                break;
            //additional case statement for vendorbill approval : JPG 07/23/21
            case 'vendorbill':
                var output = url.resolveRecord({
                    recordType: 'vendorbill',
                    recordId: scriptContext.newRecord.id,
                    isEditMode: false
                });

                strSubject = 'Vendor Bill ' + scriptContext.newRecord.getValue('tranid') + ' for Approval',
                strBody =  'Vendor Bill <a href="'+ output +'">'+ scriptContext.newRecord.getValue('tranid') +'</a> is waiting for approval.'
                break;
            //additional case statement for return authorization approval : JPG 08/05/21
            case 'returnauthorization':
                var output = url.resolveRecord({
                    recordType: 'returnauthorization',
                    recordId: scriptContext.newRecord.id,
                    isEditMode: false
                });

                strSubject = 'Return Authorization ' + scriptContext.newRecord.getValue('tranid') + ' for Approval',
                strBody =  'Return Authorization <a href="'+ output +'">'+ scriptContext.newRecord.getValue('tranid') +'</a> is waiting for approval.'
                break;
            case 'purchaserequisition':
                var output = url.resolveRecord({
                    recordType: 'purchaserequisition',
                    recordId: scriptContext.newRecord.id,
                    isEditMode: false
                });
                
                var cfoApprovalRequired = objScript.getParameter('custscript_kd_wa_cfo_apprvl_required');

                if(cfoApprovalRequired){
                    strBody =  'Purchase Requisition <a href="'+ output +'">'+ scriptContext.newRecord.getValue('tranid') +'</a> requires your approval.'
                }else{
                    strBody =  'Purchase Requisition <a href="'+ output +'">'+ scriptContext.newRecord.getValue('tranid') +'</a> does not require your approval.'
                }

                strSubject = 'New Purchase Requisition ' + scriptContext.newRecord.getValue('tranid');
                //strBody =  'Purchase Requisition <a href="'+ output +'">'+ scriptContext.newRecord.getValue('tranid') +'</a> is waiting for approval.'
                break;
            default:
            // code block
        }

        var empSearch = search.create({
            type: search.Type.EMPLOYEE,
            filters: [{
                name: 'custentity_kd_isfinancemgmt',
                operator: search.Operator.IS,
                values: ['T']
            }],
            columns: [{
                name: 'internalid'
            }]
        });

        var searchRs = empSearch.run();
        var rs = searchRs.getRange(0, 1000);
        if(rs.length > 0){
            var recipients = [];
            for(var i = 0; i < rs.length; i++){
                recipients.push(rs[i].getValue({name: 'internalid'}));
            }

            email.send({
                author: runtime.getCurrentUser().id,
                recipients: recipients,//rs[0].getValue({name: 'internalid'}),
                subject: strSubject,
                body: strBody
            });
        }

        return;
    }

    return {
        onAction: onAction
    }
});