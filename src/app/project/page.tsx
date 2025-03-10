// src/app/project/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProjectService, Project } from '@/app/services/projectservice'; 
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await ProjectService.getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const success = await ProjectService.deleteProject(id);
        if (success) {
          setProjects(projects.filter(project => project.id !== id));
        } else {
          setError('Failed to delete project');
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project');
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-white-slate">Your Projects</h1>
        <p className="text-slate-blue mb-6">
          View and manage your saved AI-generated applications
        </p>
        <Link href="/" className="btn-primary inline-block mb-8">
          Create New Project
        </Link>
      </motion.div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-blue">Loading projects...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-blue">No projects found. Create your first one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-2 text-light-slate">{project.title}</h2>
              <p className="text-slate-blue mb-4 line-clamp-2">{project.description}</p>
              <div className="text-sm text-slate-blue/70 mb-4">
                Created: {project.createdAt.toLocaleDateString()}
              </div>
              <div className="flex justify-between">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-green-blue hover:underline"
                >
                  Open Project
                </Link>
                <button
                  onClick={() => project.id && handleDeleteProject(project.id)}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}