import { Divider, Stack } from '@mantine/core';
import { ComponentType, memo } from 'react';
import  { Node, NodeProps}from 'reactflow'
import { getClassImpl } from '../util/uml/ClassImpl';


const ClassImpl = ({data, isConnectable, type}: NodeProps) => {
    getClassImpl(data.lib).then((cImpl) => {
        data.jvmObj = cImpl;
    })
       return (<div style={{padding: "2%"}}><Stack bg="gray">
            {`${data.label} : ${type}`}
            <Divider />
            <Divider />
        </Stack></div>)
}

export default ClassImpl;