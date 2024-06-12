import React from 'react';
import ExtensionService from '../../extension-service/core'
import businPugins  from '../../pugins/_pugins'
import systemPugins  from './pugins/_pugins'

export class AdvanceGrid extends React.Component{


    componentDidMount(): void {
        const pugins = [
            ...systemPugins,
            ...businPugins
        ]
        new ExtensionService({
            extension: pugins,
            activating: 'onDomRender'
        })
    }


    render(): React.ReactNode {
        return (
            <div>row</div>
        )
    }
}


// const es = [
//     {
//         "name":{
//             manifest: '',
//             class: import ('../appLocation/index')
//         }
//     }
// ]


// export default  es;