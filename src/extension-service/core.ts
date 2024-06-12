import { IExtension } from './types/extension'


interface Options{
    // 收集插件
    extension: IExtension[]
    // 激活点
    activating: string
}

export default class ExtensionService {

    private extension: IExtension[]

    constructor(options: Options){

    }

    // const contributes = CreatedContributes(options)

    private init(){
        const contributes = []
        const commander = []
        const lifecycle = []
    }

    public onactivating(){
        
    }


    public active(){

    }

    
}