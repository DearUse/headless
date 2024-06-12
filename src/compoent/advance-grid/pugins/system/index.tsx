import { ExtensionAbstractService } from '../../extension-service/abstract/ExtendService';

class Extends implements ExtensionAbstractService{

    activate(){
        // pugin.registCommand('ppLocation.form.created.onSuccess', this.onSuccess)
   
        // pugin.lifecycle('onDomRender', this.onDomRender)
    }


    onDomRender(){
        return (
            <div></div>
        )
    }

    onSuccess(){

    }

    destroy(){
        
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new Extends()