// src/app/services/projectservice.ts (statt src/services/projectservice.ts)
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { GameConfig } from '@/app/services/gamegenerator';

export interface Project {
  id?: string;
  title: string;
  description: string;
  type: 'game' | 'app' | 'website';
  prompt: string;
  gameConfig?: GameConfig;
  code?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const projectsCollection = collection(db, 'projects');

export const ProjectService = {
  async getProjects(userId?: string): Promise<Project[]> {
    try {
      let projectsQuery;
      
      if (userId) {
        projectsQuery = query(projectsCollection, where('userId', '==', userId));
      } else {
        projectsQuery = projectsCollection;
      }
      
      const snapshot = await getDocs(projectsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Project;
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  },

  async getProject(id: string): Promise<Project | null> {
    try {
      const docRef = doc(projectsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Project;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
    try {
      const now = new Date();
      const newProject = {
        ...project,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(projectsCollection, newProject);
      
      return {
        id: docRef.id,
        ...newProject
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  },

  async updateProject(id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      const docRef = doc(projectsCollection, id);
      
      await updateDoc(docRef, {
        ...project,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      const docRef = doc(projectsCollection, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }
};