import { ExtensionAbstractService } from '../abstract/ExtendService';

export interface IExtension {
    scheme: string;
    class: ExtensionAbstractService
}
