/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/runtime', 'N/record', 'N/search'],
function(runtime, record, search) {
    function _isGroupCbsSubsidiary(subsidiaryId){
        var lookupFields;
		if(subsidiaryId == '3')
                return true;
        do{
            lookupFields = search.lookupFields({
                type: search.Type.SUBSIDIARY,
                id: subsidiaryId,
                columns: ['parent']
            });

            subsidiaryId = lookupFields['parent'];
            if(subsidiaryId == '3')
                return true;
        }while(subsidiaryId != '');

        return false;
    }
    function beforeLoad(context) {
        if (context.type !== context.UserEventType.CREATE)
            return;

        log.debug('test', context.type);
        log.debug('test', runtime.executionContext);
        log.debug('test', context.newRecord.getValue('transform'));
        var userSubsidiary = runtime.getCurrentUser().subsidiary;
        log.debug('userSub', userSubsidiary);
        
        if(context.newRecord.getValue('transform') == undefined || context.newRecord.getValue('transform') != 'purchord'){
            if(!_isGroupCbsSubsidiary(userSubsidiary))
                throw('Please create a Purchase Order first.');
        }
            
        //if (runtime.executionContext !== runtime.ContextType.USEREVENT)
        /*if (context.type === context.UserEventType.CREATE)
        throw('Please create a requisition first.');*/
    }
    function beforeSubmit(context) {
        if (context.type !== context.UserEventType.CREATE)
            return;
		
        var userSubsidiary = runtime.getCurrentUser().subsidiary;
        if(context.newRecord.getValue('transform') == undefined || context.newRecord.getValue('transform') != 'purchord'){
            if(!_isGroupCbsSubsidiary(userSubsidiary))
                throw('Please create a Purchase Order first.');
        }
    }
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
     };
 });