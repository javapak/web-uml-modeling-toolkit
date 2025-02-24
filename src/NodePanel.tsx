import { Stack } from "@mantine/core";

export default function NodePanel() {

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };
    
    return (
        <div style={{width: 125, height: 100, backgroundColor: "blue"}} onDragStart={(event) => {
            onDragStart(event, "Class") 
         }} draggable>
          Class
        </div>
    );
}