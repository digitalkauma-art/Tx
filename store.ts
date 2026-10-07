import { WebsiteProject } from "../types";

const KEY = "kauma-design-projects-v1";

export function loadProjects(): WebsiteProject[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveProjects(projects: WebsiteProject[]) {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function upsertProject(project: WebsiteProject) {
  const projects = loadProjects();
  const next = [project, ...projects.filter(p => p.id !== project.id)];
  saveProjects(next);
}

export function deleteProject(id: string) {
  saveProjects(loadProjects().filter(p => p.id !== id));
}