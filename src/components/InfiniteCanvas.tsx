import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type OnConnect,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Smartphone,
  Tablet,
  Monitor,
  Layout,
  Presentation,
  BarChart3,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import type { DesignScreen, DesignSession, BYOKConfig, PreviewDevice, DesignSystem } from '../types';
import { DEVICE_VIEWPORTS } from '../lib/deviceViewports';

/* ------------------------------------------------------------------ */
/*  Screen Card Node                                                   */
/* ------------------------------------------------------------------ */

interface ScreenNodeData {
  screen: DesignScreen;
  isActive: boolean;
  theme: 'light' | 'dark';
  onGenerate: (screenId: string, prompt: string) => void;
  [key: string]: unknown;
}

const KIND_ICONS: Record<string, React.FC<{ className?: string }>> = {
  website: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  dashboard: Layout,
  landing: Monitor,
  chart: BarChart3,
  motion: Sparkles,
  presentation: Presentation,
  component: Layout,
  other: Monitor,
};

const KIND_LABELS: Record<string, string> = {
  website: 'Web',
  mobile: 'Mobile',
  tablet: 'Tablet',
  dashboard: 'Dashboard',
  landing: 'Landing',
  chart: 'Chart',
  motion: 'Motion',
  presentation: 'Deck',
  component: 'Component',
  other: 'Screen',
};

function ScreenNode({ data, selected }: NodeProps<Node<ScreenNodeData>>) {
  const { screen, isActive, theme } = data;
  const isLight = theme === 'light';
  const latestTurn = screen.turns[screen.activeTurnIndex] || screen.turns[0];
  const html = latestTurn?.codeHtml || '';
  const KindIcon = KIND_ICONS[screen.kind] || Monitor;
  const turnCount = screen.turns.length;

  return (
    <div
      className={`relative group transition-all duration-150 ${
        selected ? 'ring-2 ring-[#d97757] ring-offset-2' : ''
      } ${isActive ? 'ring-2 ring-[#d97757]' : ''}`}
      style={{ width: 320, height: 420 }}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#d97757] !border-2 !border-white !-top-1.5"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#d97757] !border-2 !border-white !-bottom-1.5"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-[#d97757] !border-2 !border-white !-left-1.5"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-[#d97757] !border-2 !border-white !-right-1.5"
      />

      {/* Card */}
      <div
        className={`w-full h-full rounded-xl border overflow-hidden flex flex-col shadow-lg transition-shadow ${
          isLight
            ? 'bg-[#f4f0e8] border-[#e2ddd3]'
            : 'bg-[#22201d] border-[#38342e]'
        } ${selected || isActive ? 'shadow-2xl' : 'hover:shadow-xl'}`}
      >
        {/* Header bar */}
        <div
          className={`px-3 py-2 flex items-center justify-between gap-2 shrink-0 border-b ${
            isLight
              ? 'bg-[#ebe6dc] border-[#ded8cc]'
              : 'bg-[#1b1a17] border-[#3d3831]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GripVertical className={`w-3.5 h-3.5 shrink-0 cursor-grab ${
              isLight ? 'text-[#9e978a]' : 'text-[#736e65]'
            }`} />
            <KindIcon className="w-3.5 h-3.5 text-[#d97757] shrink-0" />
            <span className={`text-xs font-semibold truncate ${
              isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'
            }`}>
              {screen.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
              isLight
                ? 'bg-[#d97757]/10 text-[#a94a2e]'
                : 'bg-[#d97757]/20 text-[#e28566]'
            }`}>
              {KIND_LABELS[screen.kind] || 'Screen'}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              isLight
                ? 'bg-white/80 text-[#736e65]'
                : 'bg-[#2a2723] text-[#9e978a]'
            }`}>
              {turnCount} {turnCount === 1 ? 'turn' : 'turns'}
            </span>
          </div>
        </div>

        {/* Scaled iframe preview */}
        <div className="flex-1 relative overflow-hidden bg-white">
          {html ? (
            <div
              className="absolute origin-top-left"
              style={{
                width: DEVICE_VIEWPORTS.mobile.width,
                height: DEVICE_VIEWPORTS.mobile.height,
                transform: `scale(${320 / DEVICE_VIEWPORTS.mobile.width})`,
                transformOrigin: 'top left',
              }}
            >
              <iframe
                srcDoc={html}
                title={screen.name}
                className="w-full h-full border-none pointer-events-none"
                sandbox="allow-scripts"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#d97757] opacity-40" />
                <p className={`text-xs ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
                  No preview yet
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Active indicator bar */}
        {isActive && (
          <div className="h-1 bg-[#d97757] shrink-0" />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Infinite Canvas                                                    */
/* ------------------------------------------------------------------ */

interface InfiniteCanvasProps {
  session: DesignSession;
  activeScreenId: string;
  onSelectScreen: (screenId: string) => void;
  onAddScreen: () => void;
  onPlanApp: () => void;
  onRenameScreen: (screenId: string, name: string) => void;
  onDeleteScreen: (screenId: string) => void;
  theme: 'light' | 'dark';
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  session,
  activeScreenId,
  onSelectScreen,
  onAddScreen,
  onPlanApp,
  theme,
}) => {
  const isLight = theme === 'light';
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Build nodes from screens — auto-layout if no saved position
  const initialNodes: Node<ScreenNodeData>[] = useMemo(() => {
    return session.screens.map((screen, idx) => {
      const pos = screen.canvasPosition || {
        x: (idx % 4) * 380 + 40,
        y: Math.floor(idx / 4) * 500 + 40,
      };
      return {
        id: screen.id,
        type: 'screenNode',
        position: pos,
        data: {
          screen,
          isActive: screen.id === activeScreenId,
          theme,
          onGenerate: () => {},
        },
      };
    });
  }, [session.screens, activeScreenId, theme]);

  // Build edges from connections
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (const screen of session.screens) {
      if (screen.connections) {
        for (const targetId of screen.connections) {
          edges.push({
            id: `${screen.id}->${targetId}`,
            source: screen.id,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#d97757', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#d97757',
              width: 16,
              height: 16,
            },
          });
        }
      }
    }
    return edges;
  }, [session.screens]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when session data changes
  useEffect(() => {
    setNodes(
      session.screens.map((screen, idx) => {
        const pos = screen.canvasPosition || {
          x: (idx % 4) * 380 + 40,
          y: Math.floor(idx / 4) * 500 + 40,
        };
        return {
          id: screen.id,
          type: 'screenNode',
          position: pos,
          data: {
            screen,
            isActive: screen.id === activeScreenId,
            theme,
            onGenerate: () => {},
          },
        };
      })
    );
    // Also rebuild edges
    const edges: Edge[] = [];
    for (const screen of session.screens) {
      if (screen.connections) {
        for (const targetId of screen.connections) {
          edges.push({
            id: `${screen.id}->${targetId}`,
            source: screen.id,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#d97757', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#d97757',
              width: 16,
              height: 16,
            },
          });
        }
      }
    }
    setEdges(edges);
  }, [session.screens, activeScreenId, theme, setNodes, setEdges]);

  const nodeTypes: NodeTypes = useMemo(() => ({ screenNode: ScreenNode }), []);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#d97757', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#d97757',
              width: 16,
              height: 16,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectScreen(node.id);
    },
    [onSelectScreen]
  );

  const minimapNodeColor = useCallback((node: Node) => {
    return node.id === activeScreenId ? '#d97757' : isLight ? '#c4bdae' : '#3d3831';
  }, [activeScreenId, isLight]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#d97757', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className={isLight ? 'bg-[#faf8f5]' : 'bg-[#181715]'}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode="Delete"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isLight ? '#d6cfc4' : '#38342e'}
        />
        <Controls
          className={`!rounded-lg !border !shadow-md ${
            isLight
              ? '!bg-white !border-[#e2ddd3]'
              : '!bg-[#2a2723] !border-[#3d3831]'
          }`}
          showInteractive={false}
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={2}
          className={`!rounded-lg !border !shadow-md ${
            isLight
              ? '!bg-[#f4f0e8]/80 !border-[#e2ddd3]'
              : '!bg-[#22201d]/80 !border-[#3d3831]'
          }`}
          maskColor={isLight ? 'rgba(250, 248, 245, 0.7)' : 'rgba(24, 23, 21, 0.7)'}
        />

        {/* Top-center toolbar */}
        <Panel position="top-center">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-lg ${
            isLight
              ? 'bg-white/95 border-[#e2ddd3] backdrop-blur-sm'
              : 'bg-[#22201d]/95 border-[#38342e] backdrop-blur-sm'
          }`}>
            <button
              onClick={onAddScreen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isLight
                  ? 'bg-[#d97757] text-white hover:bg-[#c66545]'
                  : 'bg-[#d97757] text-white hover:bg-[#c66545]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Screen
            </button>
            <button
              onClick={onPlanApp}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isLight
                  ? 'bg-white hover:bg-[#f0e9dd] text-[#22201d] border-[#e2ddd3]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#f4f0ea] border-[#3d3831]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d97757]" />
              Plan App
            </button>
            <div className={`w-px h-6 ${isLight ? 'bg-[#e2ddd3]' : 'bg-[#3d3831]'}`} />
            <span className={`text-[11px] font-medium ${
              isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
            }`}>
              {session.screens.length} {session.screens.length === 1 ? 'screen' : 'screens'}
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
