import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { Source } from '../../types/investigation'
import { RoughBox } from '../sketch/RoughBox'

type MapNodeData = {
  label: string
  variant: 'claim' | 'branch' | 'source'
  accent?: string
}

// One node component for all three node kinds; the rough rectangle plus a
// small color accent (for source nodes) does the rest of the differentiation
// instead of separate components per kind.
function MapNode({ data }: NodeProps<Node<MapNodeData>>) {
  const isClaim = data.variant === 'claim'
  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <RoughBox
        strokeWidth={isClaim ? 2.25 : 1.5}
        stroke={data.accent ?? '#111111'}
        className={`px-3 py-2 text-center ${isClaim ? 'w-56' : 'w-40'}`}
      >
        <span className={`font-hand ${isClaim ? 'text-base' : 'text-sm'}`}>{data.label}</span>
      </RoughBox>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </>
  )
}

const nodeTypes = { mapNode: MapNode }

interface EvidenceMapProps {
  claim: string
  sources: Source[]
  onSelectSource: (id: string) => void
}

// Lays the claim, two branches (supports / contradicts), and each source out
// as a fixed tree, matching TRACE's evidence map diagram: claim at the top,
// branching into the two relationships, leafing into individual sources.
export function EvidenceMap({ claim, sources, onSelectSource }: EvidenceMapProps) {
  const supporting = sources.filter((s) => s.relationship === 'supports')
  const contradicting = sources.filter((s) => s.relationship !== 'supports')

  const { nodes, edges } = useMemo(() => {
    const nodes: Node<MapNodeData>[] = [
      { id: 'claim', type: 'mapNode', position: { x: 260, y: 0 }, data: { label: claim, variant: 'claim' } },
      {
        id: 'supports',
        type: 'mapNode',
        position: { x: 100, y: 120 },
        data: { label: 'Supports', variant: 'branch', accent: 'var(--verdict-supported)' },
      },
      {
        id: 'contradicts',
        type: 'mapNode',
        position: { x: 480, y: 120 },
        data: { label: 'Contradicts', variant: 'branch', accent: 'var(--verdict-contradicted)' },
      },
      ...supporting.map((s, i) => ({
        id: s.id,
        type: 'mapNode',
        position: { x: 20 + i * 170, y: 260 },
        data: { label: s.title, variant: 'source' as const, accent: 'var(--verdict-supported)' },
      })),
      ...contradicting.map((s, i) => ({
        id: s.id,
        type: 'mapNode',
        position: { x: 420 + i * 170, y: 260 },
        data: { label: s.title, variant: 'source' as const, accent: 'var(--verdict-contradicted)' },
      })),
    ]

    const edges: Edge[] = [
      { id: 'e-claim-supports', source: 'claim', target: 'supports' },
      { id: 'e-claim-contradicts', source: 'claim', target: 'contradicts' },
      ...supporting.map((s) => ({ id: `e-supports-${s.id}`, source: 'supports', target: s.id })),
      ...contradicting.map((s) => ({ id: `e-contradicts-${s.id}`, source: 'contradicts', target: s.id })),
    ].map((e) => ({ ...e, style: { stroke: '#111111', strokeWidth: 1.5 } }))

    return { nodes, edges }
  }, [claim, supporting, contradicting])

  return (
    <div className="h-[420px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          if (node.id !== 'claim' && node.id !== 'supports' && node.id !== 'contradicts') {
            onSelectSource(node.id)
          }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} color="#d8d8d8" />
      </ReactFlow>
    </div>
  )
}
