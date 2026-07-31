import { create } from 'zustand';
import { Project, ProjectPhase, RoadmapData, ArchitectureDoc, Milestone } from '@build-and-learn/shared-types';

interface ProjectState {
  currentProject: Project | null;
  phase: ProjectPhase;
  roadmap: RoadmapData | null;
  architecture: ArchitectureDoc | null;
  milestones: Milestone[];
  activeMilestoneId: string | null;

  setProject: (project: Project) => void;
  setPhase: (phase: ProjectPhase) => void;
  setRoadmap: (roadmap: RoadmapData) => void;
  setArchitecture: (architecture: ArchitectureDoc) => void;
  setMilestones: (milestones: Milestone[]) => void;
  setActiveMilestoneId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  phase: 'definition',
  roadmap: null,
  architecture: null,
  milestones: [],
  activeMilestoneId: null,

  setProject: (project) => set({ currentProject: project, phase: project.phase }),
  setPhase: (phase) => set({ phase }),
  setRoadmap: (roadmap) => set({ roadmap }),
  setArchitecture: (architecture) => set({ architecture }),
  setMilestones: (milestones) => set({ milestones }),
  setActiveMilestoneId: (activeMilestoneId) => set({ activeMilestoneId })
}));
