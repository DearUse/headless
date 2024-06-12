import { ExtensionAbstractService } from '../../extension-service/abstract/ExtendService';

class Extends implements ExtensionAbstractService{

    activate(){
        // pugin.registCommand('ppLocation.form.created.onSuccess', this.onSuccess)
    }

    onSuccess(){

    }

    destroy(){
        
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new Extends()