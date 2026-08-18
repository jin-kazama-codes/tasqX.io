"use client";

import { useWorkflow } from "@/hooks/query-hooks/use-workflow";
import { useCookie } from "@/hooks/use-cookie";
import { recalculateEdges } from "@/utils/helpers";
import React, { useState, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
} from "reactflow";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineShare,
  HiOutlineSparkles,
} from "react-icons/hi2";

import "reactflow/dist/style.css";

const Workflow = () => {
  const user = useCookie("user");
  const isAdminOrManager =
    user && (user.role === "admin" || user.role === "manager");

  const {
    data: workflow,
    isLoading,
    isError,
    error,
    updateWorkflow,
  } = useWorkflow();

  const [nodes, setNodes, onNodesChangeBase] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeId, setNodeId] = useState(1);
  const [nodeName, setNodeName] = useState("");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasAddedNode, setHasAddedNode] = useState(false);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [editingName, setEditingName] = useState("");
  const [originalEdges, setOriginalEdges] = useState<any[]>([]);

  const onNodesChange = (changes: any) => {
    if (!isAdminOrManager) return;
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);
      recalculateEdges(updatedNodes, setEdges);
      return updatedNodes;
    });
  };

  const edgesHaveChanged =
    JSON.stringify(edges) !== JSON.stringify(originalEdges);

  useEffect(() => {
    if (workflow) {
      const rawNodes = workflow.nodes || [
        { id: "1", position: { x: 50, y: 150 }, data: { label: "TODO" } },
        { id: "2", position: { x: 300, y: 150 }, data: { label: "IN_PROGRESS" } },
        { id: "3", position: { x: 550, y: 150 }, data: { label: "DONE" } },
      ];
      const rawEdges = workflow.edges || [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
      ];

      const initialNodes = rawNodes.map((node: any, idx: number) => ({
        id: String(node.id || idx + 1),
        position: node.position || { x: idx * 250 + 50, y: 150 },
        data: { label: node.data?.label || node.label || "Status" },
        style: {
          background: "#ffffff",
          border: "1.5px solid #6366f1",
          borderRadius: "12px",
          padding: "10px 18px",
          fontWeight: 700,
          fontSize: "13px",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.12)",
          color: "#0f172a",
        },
      }));

      const initialEdges = rawEdges.map((edge: any) => ({
        id: edge.id || `e${edge.source}-${edge.target}`,
        source: String(edge.source),
        target: String(edge.target),
        animated: true,
        style: { stroke: "#6366f1", strokeWidth: 2 },
      }));

      setNodes(initialNodes);
      setEdges(initialEdges);
      setOriginalEdges(initialEdges);
      setNodeId(rawNodes.length + 1);
    }
  }, [workflow]);

  const addNode = () => setShowModal(true);

  const updateFlow = () => {
    if (!isAdminOrManager) return;
    const reorderedNodes = [...nodes].sort(
      (a, b) => a.position.x - b.position.x
    );
    const nodesWithUpdatedIds = reorderedNodes.map((node, index) => ({
      ...node,
      id: `${index + 1}`,
    }));
    updateWorkflow({ nodes: nodesWithUpdatedIds, edges });
    setOriginalEdges(edges);
    setSelectedNode(null);
    setHasAddedNode(false);
  };

  const handleAddNode = () => {
    if (!isAdminOrManager) return;
    if (nodeName.trim()) {
      const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : null;
      const newNodePosition = {
        x: lastNode ? lastNode.position.x + 220 : 100,
        y: 150,
      };

      const newNode = {
        id: `${nodeId}`,
        position: newNodePosition,
        data: { label: nodeName.trim().toUpperCase() },
        style: {
          background: "#ffffff",
          border: "1.5px solid #6366f1",
          borderRadius: "12px",
          padding: "10px 18px",
          fontWeight: 700,
          fontSize: "13px",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.12)",
          color: "#0f172a",
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setNodeId((id) => id + 1);
      setNodeName("");
      setShowModal(false);
      setHasAddedNode(true);
    }
  };

  const handleCancel = () => {
    setNodeName("");
    setShowModal(false);
  };

  const onNodeClick = (_: any, node: any) => {
    if (!isAdminOrManager) return;
    setSelectedNode(node);
  };

  const onNodeDoubleClick = (_: any, node: any) => {
    if (!isAdminOrManager) return;
    setEditingNode(node);
    setEditingName(node.data.label);
  };

  const handleUpdateNodeName = () => {
    if (editingName.trim() && editingNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === editingNode.id
            ? { ...node, data: { ...node.data, label: editingName.trim().toUpperCase() } }
            : node
        )
      );
      setEditingNode(null);
      setEditingName("");
      setHasAddedNode(true);
    }
  };

  const deleteNode = () => {
    if (selectedNode && isAdminOrManager) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );

      const remainingNodes = nodes.filter(
        (node) => node.id !== selectedNode.id
      );
      const updatedEdges: any[] = [];

      remainingNodes.forEach((node, index) => {
        if (remainingNodes[index + 1]) {
          updatedEdges.push({
            id: `e${node.id}-${remainingNodes[index + 1].id}`,
            source: node.id,
            target: remainingNodes[index + 1].id,
            animated: true,
            style: { stroke: "#6366f1", strokeWidth: 2 },
          });
        }
      });

      setEdges(updatedEdges);
      setSelectedNode(null);
      setHasAddedNode(true);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48 rounded-xl" />
          <div className="skeleton h-10 w-32 rounded-xl" />
        </div>
        <div className="h-[75vh] w-full rounded-2xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Loading interactive workflow canvas…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
            <HiOutlineShare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Project Workflow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure task lifecycle stages and transitions
            </p>
          </div>
        </div>

        {isAdminOrManager && (
          <div className="flex items-center gap-2">
            <button
              onClick={addNode}
              className="btn-brand py-2 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <HiOutlinePlus className="h-4 w-4" />
              <span>Add Stage</span>
            </button>

            {selectedNode && (
              <button
                onClick={deleteNode}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
              >
                <HiOutlineTrash className="h-4 w-4" />
                <span>Delete Stage</span>
              </button>
            )}

            {(edgesHaveChanged || hasAddedNode) && (
              <button
                onClick={updateFlow}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-semibold shadow-md transition-colors animate-pulse"
              >
                <HiOutlineCheck className="h-4 w-4" />
                <span>Save Workflow</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Interactive Flow Canvas */}
      <div className="h-[75vh] w-full rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={() => {}}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
        >
          <MiniMap
            nodeColor="#6366f1"
            className="!rounded-xl !border !border-slate-200 dark:!border-surface-border-d !bg-white/80 dark:!bg-surface-raised-d/80 backdrop-blur-md !bottom-4 !right-4"
          />
          <Controls className="!rounded-xl !border !border-slate-200 dark:!border-surface-border-d !bg-white dark:!bg-surface-raised-d !shadow-md" />
          <Background color="#6366f1" gap={20} size={1} className="opacity-20" />
        </ReactFlow>
      </div>

      {/* Add Node Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d p-6 shadow-modal space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add Workflow Stage
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Stage Name
              </label>
              <input
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="e.g. CODE_REVIEW, TESTING"
                className="input-field text-sm w-full uppercase"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="btn-secondary py-2 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNode}
                className="btn-brand py-2 px-4 text-xs"
              >
                Add Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Node Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d p-6 shadow-modal space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Edit Stage Name
            </h2>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Stage Name"
              className="input-field text-sm w-full uppercase"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingNode(null)}
                className="btn-secondary py-2 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateNodeName}
                className="btn-brand py-2 px-4 text-xs"
              >
                Update Name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflow;
