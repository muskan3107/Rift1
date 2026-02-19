"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { SuspiciousAccount, FraudRing } from "@/lib/types";

// Dynamic import to avoid SSR issues with three.js
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

interface Graph3DProps {
  accounts: SuspiciousAccount[];
  rings: FraudRing[];
  edges: Array<{
    source: string;
    target: string;
    total_amount: number;
    earliest_timestamp: string;
    latest_timestamp: string;
  }>;
  onNodeClick: (account: SuspiciousAccount) => void;
  selectedRingId: string | null;
  searchQuery: string;
  hideWhitelisted: boolean;
  timeVelocityFilter: number; // 0-72 hours
}

export default function Graph3D({
  accounts,
  rings,
  edges,
  onNodeClick,
  selectedRingId,
  searchQuery,
  hideWhitelisted,
  timeVelocityFilter,
}: Graph3DProps) {
  const fgRef = useRef<any>();
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });

  // Whitelist for known business nodes (example)
  const whitelistedAccounts = ["ACC012"]; // Add your whitelist here

  // Build a map of which edges belong to rings
  const ringEdgeMap = new Map<string, string>();
  rings.forEach((ring) => {
    for (let i = 0; i < ring.member_accounts.length; i++) {
      const source = ring.member_accounts[i];
      const target = ring.member_accounts[(i + 1) % ring.member_accounts.length];
      ringEdgeMap.set(`${source}-${target}`, ring.ring_id);
    }
  });

  useEffect(() => {
    // Filter accounts based on search and whitelist
    let filteredAccounts = accounts;

    if (searchQuery) {
      filteredAccounts = filteredAccounts.filter((acc) =>
        acc.account_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (hideWhitelisted) {
      filteredAccounts = filteredAccounts.filter(
        (acc) => !whitelistedAccounts.includes(acc.account_id)
      );
    }

    // Filter edges based on time velocity
    const filteredEdges = edges.filter((edge) => {
      const timestamp = new Date(edge.earliest_timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= timeVelocityFilter;
    });

    // Build graph data
    const nodes = filteredAccounts.map((acc) => {
      const isHighRisk = acc.suspicion_score > 70;
      const isInSelectedRing = selectedRingId && acc.ring_id === selectedRingId;
      const isDimmed = selectedRingId && acc.ring_id !== selectedRingId;

      return {
        id: acc.account_id,
        name: acc.account_id,
        val: isHighRisk ? 20 : 10, // Node size for sphere radius
        color: isInSelectedRing
          ? "#00FFFF" // Cyan for selected ring
          : isHighRisk
          ? "#FF3131" // Neon red for high risk
          : isDimmed
          ? "#334155" // Dimmed
          : "#3B82F6", // Blue for normal
        suspicion_score: acc.suspicion_score,
        detected_patterns: acc.detected_patterns,
        ring_id: acc.ring_id,
        opacity: isDimmed ? 0.3 : 1,
      };
    });

    const links = filteredEdges
      .filter((edge) => {
        // Only include edges where both nodes exist
        return (
          filteredAccounts.some((acc) => acc.account_id === edge.source) &&
          filteredAccounts.some((acc) => acc.account_id === edge.target)
        );
      })
      .map((edge) => {
        const sourceNode = filteredAccounts.find(
          (acc) => acc.account_id === edge.source
        );
        const targetNode = filteredAccounts.find(
          (acc) => acc.account_id === edge.target
        );

        const edgeKey = `${edge.source}-${edge.target}`;
        const isPartOfRing = ringEdgeMap.has(edgeKey);
        const edgeRingId = ringEdgeMap.get(edgeKey);

        const isInSelectedRing =
          selectedRingId &&
          sourceNode?.ring_id === selectedRingId &&
          targetNode?.ring_id === selectedRingId;

        const isDimmed =
          selectedRingId &&
          (sourceNode?.ring_id !== selectedRingId ||
            targetNode?.ring_id !== selectedRingId);

        // Color logic: Neon Red for ring edges, Cyan otherwise
        let linkColor = "#00F3FF"; // Cyan default
        if (isPartOfRing) {
          linkColor = "#FF3131"; // Neon red for ring edges
        }
        if (isInSelectedRing) {
          linkColor = "#00FFFF"; // Bright cyan for selected ring
        }
        if (isDimmed) {
          linkColor = "#1E293B"; // Dimmed
        }

        return {
          source: edge.source,
          target: edge.target,
          color: linkColor,
          opacity: isDimmed ? 0.2 : 0.8,
          width: Math.max(edge.total_amount / 2000, 1), // Scale width by amount
          amount: edge.total_amount,
        };
      });

    setGraphData({ nodes, links });

    // Auto-zoom to fit all nodes after data loads
    if (fgRef.current && nodes.length > 0) {
      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 50);
      }, 100);
    }
  }, [
    accounts,
    edges,
    rings,
    selectedRingId,
    searchQuery,
    hideWhitelisted,
    timeVelocityFilter,
  ]);

  const handleNodeClick = useCallback(
    (node: any) => {
      const account = accounts.find((acc) => acc.account_id === node.id);
      if (account) {
        onNodeClick(account);
      }
    },
    [accounts, onNodeClick]
  );

  // Custom node rendering with 3D spheres
  const nodeThreeObject = useCallback((node: any) => {
    const isHighRisk = node.suspicion_score > 70;
    const radius = isHighRisk ? 8 : 5;

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    
    // Create material with emissive glow for high-risk nodes
    const material = new THREE.MeshLambertMaterial({
      color: node.color,
      transparent: true,
      opacity: node.opacity,
      emissive: isHighRisk ? node.color : "#000000",
      emissiveIntensity: isHighRisk ? 0.3 : 0,
    });

    const sphere = new THREE.Mesh(geometry, material);

    // Add glow effect for high-risk nodes
    if (isHighRisk) {
      const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      sphere.add(glow);
    }

    return sphere;
  }, []);

  return (
    <div className="w-full h-full">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeThreeObject={nodeThreeObject}
        nodeColor={(node: any) => node.color}
        linkColor={(link: any) => link.color}
        linkOpacity={(link: any) => link.opacity || 0.8}
        linkWidth={(link: any) => link.width || 1}
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.01}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleColor={(link: any) => link.color}
        onNodeClick={handleNodeClick}
        backgroundColor="#020617"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        // Enable force physics
        d3Force="charge"
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={0}
      />
    </div>
  );
}
