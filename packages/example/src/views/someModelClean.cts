
import { MarkerType, ViewModel } from '../../../core/src/base.metamodel';

const viewModel: ViewModel = {
  "@context": 'git@repo.techngs.us:technergetics/techngs-metamodel/base.metamodel',
  "@id": "git@repo.techngs.us:technergetics/techngs-metamodel/example.model/<some_id>",
  viewModelNodes: [
    {
      "@context": 'git@repo.techngs.us:technergetics/techngs-metamodel/base.metamodel',
      "@id": 'git@repo.techngs.us:technergetics/techngs-metamodel/example.view/app1',
      nodeLink: 'git@repo.techngs.us:technergetics/techngs-metamodel/example.model/app1',
      position: {
        x: 0,
        y: 20,
      },
      handles: [
        {
          "@context": 'git@repo.techngs.us:technergetics/techngs-metamodel/base.metamodel',
          "@id": "git@repo.techngs.us:technergetics/techngs-metamodel/example.view/handle/handle1",
          type: 'source',
        },
      ],
    },
    {
      "@context": 'git@repo.techngs.us:technergetics/techngs-metamodel/base.metamodel',
      "@id": 'git@repo.techngs.us:technergetics/techngs-metamodel/example.view/db1',
      nodeLink: 'git@repo.techngs.us:technergetics/techngs-metamodel/example.model/db1',
      position: {
        x: 100,
        y: 20,
      },
      handles: [
        {
          "@context": 'git@repo.techngs.us:technergetics/techngs-metamodel/base.metamodel',
          "@id": "git@repo.techngs.us:technergetics/techngs-metamodel/example.view/handle/handle2",
          type: 'target',
        },
      ],
    },
  ],
  viewModelEdges: [
    {
      "@context": 'git@repo.techngs.us:technergetics/techngs-metamodel/base.metamodel',
      "@id": 'git@repo.techngs.us:technergetics/techngs-metamodel/example.view/requires1',
      sourceHandle: 'git@repo.techngs.us:technergetics/techngs-metamodel/example.view/handle/handle1',
      targetHandle: 'git@repo.techngs.us:technergetics/techngs-metamodel/example.view/handle/handle2',
      edgeLink: 'git@repo.techngs.us:technergetics/techngs-metamodel/example.model/edge1',
      markerStart: {
        type: MarkerType.None,
      },
      markerEnd: {
        type: MarkerType.Arrow,
      },
    },
  ],
}

export default viewModel;
