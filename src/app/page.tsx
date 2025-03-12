'use client';

import React from 'react';  // Füge expliziten React-Import hinzu
import { useState } from 'react';
import { motion } from 'framer-motion';
import AIChatbot from '@/components/ai-chatbot';
import Preview from '@/components/preview';
import { generateCode } from '@/lib/ai';
import { GameConfig } from '@/app/services/gameGenerator';
import { ProjectService } from '@/app/services/projectservice';
import { ImageGenerator } from '@/lib/image-generator';

const HomePage: React.FC = () => {  // Expliziter Komponententyp mit React.FC
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [projectSaved, setProjectSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [aiProvider, setAiProvider] = useState<string>('');
  const [useGeneratedAssets, setUseGeneratedAssets] = useState(true);

  const handleGenerateApp = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProjectSaved(false);
    setSaveError('');
    setAiProvider('');

    try {
      // Generate code using AI
      const generatedContent = await generateCode(prompt, 'game');
      
      // Extract AI provider information from the response
      const providerInfo = generatedContent.includes('OpenAI') ? 'OpenAI' :
                          generatedContent.includes('Grok') ? 'Grok' :
                          generatedContent.includes('DeepSeek') ? 'DeepSeek' : 'AI';
      setAiProvider(providerInfo);
      
      // Extract JSON configuration
      const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          // Parse the game config
          const configText = jsonMatch[1] || jsonMatch[0];
          const config: GameConfig = JSON.parse(configText.trim());
          
          // Make sure dimensions are set
          if (!config.dimensions) {
            config.dimensions = { width: 800, height: 600 };
          }
          
          // Generate assets if enabled
          if (useGeneratedAssets && config.type) {
            try {
              console.log(`Generating assets for ${config.type} game: ${prompt}`);
              // Generate assets based on the prompt
              const assets = await ImageGenerator.generateGameAssets(
                config.type as 'marioKart' | 'platformer', 
                prompt
              );
              
              // Update the configuration with generated assets
              config.assets = {
                ...config.assets,
                background: assets.background.url,
                player: assets.player.url,
                obstacles: assets.obstacles.map(obs => obs.url)
              };
              
              // Add track for marioKart games
              if (config.type === 'marioKart' && assets.track) {
                config.assets.track = assets.track.url;
              }
              
              console.log('Generated assets added to game config');
            } catch (assetError) {
              console.error('Error generating assets:', assetError);
              // Continue with default assets
            }
          }
          
          setGameConfig(config);
          
          // Save the project to Firebase
          const projectData = {
            title: `Game: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`,
            description: prompt,
            type: 'game' as const,
            prompt: prompt,
            gameConfig: config,
            userId: 'anonymous' // Replace with actual user ID when authentication is implemented
          };
          
          const savedProject = await ProjectService.createProject(projectData);
          
          if (savedProject) {
            setProjectSaved(true);
          } else {
            setSaveError('Failed to save project');
          }
        } catch (error) {
          console.error('Error parsing game config:', error);
          setSaveError('Invalid game configuration format');
        }
      } else {
        setSaveError('No valid game configuration found in the response');
      }
    } catch (error) {
      console.error('Error generating app:', error);
      setSaveError('Error generating application');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold mb-4 text-white-slate">Micro SaaS AI Builder</h1>
        <p className="text-xl text-slate-blue max-w-2xl mx-auto">
          Create custom SaaS applications without writing a single line of code.
          Just describe what you want, and let AI do the heavy lifting.
        </p>
      </motion.section>

      {/* App Builder Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-light-slate">AI App Builder</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-slate-blue mb-2">Enter your app description</label>
              <textarea
                id="prompt"
                className="input-field h-32"
                placeholder="Create a game like Mario Kart"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useGeneratedAssets"
                checked={useGeneratedAssets}
                onChange={(e) => setUseGeneratedAssets(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="useGeneratedAssets" className="text-slate-blue text-sm">
                Generate custom assets (uses AI image generation)
              </label>
            </div>
            
            <button
              className="btn-primary w-full"
              disabled={isGenerating || !prompt.trim()}
              onClick={handleGenerateApp}
            >
              {isGenerating ? 'Generating...' : 'Generate App'}
            </button>
            
            {projectSaved && (
              <div className="text-green-blue text-sm mt-2">
                Project saved successfully!
              </div>
            )}
            
            {saveError && (
              <div className="text-red-500 text-sm mt-2">
                {saveError}
              </div>
            )}
            
            {aiProvider && (
              <div className="text-slate-blue text-sm mt-2">
                Generated with: {aiProvider}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Preview
            gameConfig={gameConfig}
            isLoading={isGenerating}
          />
        </motion.div>
      </div>

      {/* AI Chatbot Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <AIChatbot />
      </motion.div>
      
      {/* Recent Projects Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-light-slate">Recent Projects</h2>
        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-blue">View your recent AI-generated applications</p>
          <a href="/projects" className="text-green-blue hover:underline">View All Projects</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* This section would be populated with actual projects */}
          <div className="bg-light-blue rounded-lg p-4 hover:bg-light-blue/70 transition-colors">
            <div className="text-light-slate font-medium mb-2">Sample Project</div>
            <div className="text-slate-blue text-sm mb-2 truncate">
              A simple game demonstration for Micro SaaS AI Builder
            </div>
            <div className="text-xs text-slate-blue/70">Created: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
