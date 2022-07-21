/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/search'],
 function(search) {
     function beforeSubmit(context) {
         var newRec = context.newRecord;
         log.debug('test', context.type);

         if(context.type == 'xedit'){
            //var approvedBy = newRec.getValue('custentity_kd_approved_by');
            var lookupRs =  search.lookupFields({
                type: 'customer',
                id: newRec.id,
                columns: ['custentity_kd_isrecordlocked']
            });//newRec.getValue({fieldId: 'custentity_kd_isrecordlocked'});
            var isRecordLocked = lookupRs.custentity_kd_isrecordlocked;
            log.debug('test', 'record is locked? ' + isRecordLocked);
            if(isRecordLocked){
                
            log.debug('test', 'throw error');
                throw('Record is locked for approval!');
            } 
         }
     }

     return {
         beforeSubmit: beforeSubmit
     };
 });