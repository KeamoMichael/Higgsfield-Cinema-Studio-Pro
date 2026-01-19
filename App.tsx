
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UnifiedChatBar } from './components/UnifiedChatBar';
import { ImageDisplay } from './components/ImageDisplay';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Resolution, AspectRatio, CinematicParams } from './types';
import { generateImage } from './services/geminiService';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<Resolution>(Resolution._2K);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [numVariations, setNumVariations] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Check for key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setTimeout(() => setIsKeyModalOpen(true), 1000);
        }
      }
    };
    checkKey();
  }, []);

  const handleGenerate = async (params: CinematicParams = {}, attachments?: string[], specialMode?: 'consistent-angles') => {
    setIsGenerating(true);
    setError(null);
    setImageUrls([]); 
    
    // Set the first attachment as the "Base Image" if it exists
    if (attachments && attachments.length > 0) {
      setReferenceImage(attachments[0]);
    } else {
      setReferenceImage(null);
    }
    
    try {
      const userVision = prompt.trim();
      let directorNote = "";
      
      const effectiveVariations = specialMode === 'consistent-angles' ? 4 : numVariations;

      // Only generate director notes if params are provided (Director Mode)
      if (Object.keys(params).length > 0) {
        if (params.shotType || params.viewDirection) {
          const shot = params.shotType || "Master shot";
          const angle = params.viewDirection ? `at a ${params.viewDirection}` : "";
          directorNote += `Cinematography: ${shot} ${angle}. `;
        }

        if (params.lightingSource || params.atmosphere) {
          const light = params.lightingSource || "Cinematic lighting";
          const mood = params.atmosphere ? `with a ${params.atmosphere} atmosphere` : "";
          directorNote += `Lighting: ${light} ${mood}. `;
        }

        if (params.cameraBody || params.focalLength || params.lensType) {
          const body = params.cameraBody || "Professional Cinema Camera";
          const lens = params.focalLength || "Prime Lens";
          const type = params.lensType ? `, ${params.lensType} optics` : "";
          directorNote += `Technical: Captured on ${body} using a ${lens}${type} with professional color grading. `;
        }

        if (params.genre || params.photographerStyle || params.movieLook || params.filter) {
          const genre = params.genre ? `${params.genre} photography` : "";
          const style = params.photographerStyle ? `in the signature style of ${params.photographerStyle}` : "";
          const aesthetic = params.movieLook ? `${params.movieLook} aesthetic` : "";
          const effect = params.filter ? `with ${params.filter} effect` : "";
          directorNote += `Aesthetic: ${[genre, style, aesthetic, effect].filter(Boolean).join(", ")}. `;
        }
      }

      if (specialMode === 'consistent-angles') {
        directorNote += "STRICT REQUIREMENT: Generate 4 distinct camera angles (Eye Level, Low Angle, Side Profile, Cinematic Wide) of the EXACT SAME subject and scene. Maintain absolute consistency of character details, clothing, lighting conditions, and environmental elements across all variations. ";
      }

      if (attachments && attachments.length > 0) {
        directorNote += `Maintain strict character and environmental consistency with the provided ${attachments.length} reference frame(s). `;
      }

      const finalPrompt = `${directorNote}\nSubject: ${userVision}\n--quality: premium, cinematic, highly-detailed, 8k, realistic textures, volumetric effects, masterwork.`;

      // Parallel generation for speed
      const generationPromises = Array.from({ length: effectiveVariations }).map(() => 
        generateImage(finalPrompt, resolution, aspectRatio, attachments)
      );

      const urls = await Promise.all(generationPromises);
      setImageUrls(urls);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      if (err.message && err.message.includes("Key issue")) {
        setIsKeyModalOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative h-screen bg-[#050505] flex flex-col overflow-hidden text-white">
      <Header onOpenKeyModal={() => setIsKeyModalOpen(true)} />

      <main className="flex-1 flex flex-col w-full relative z-10 pt-20 pb-40 overflow-y-auto">
        {error && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-[100] animate-fade-in-down">
                <div className="bg-[#1a1a1a] border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xl">
                    <span className="text-sm font-bold tracking-tight">{error}</span>
                    <button onClick={() => setError(null)} className="text-gray-500 hover:text-white">✕</button>
                </div>
            </div>
        )}

        <ImageDisplay 
            imageUrls={imageUrls} 
            referenceImage={referenceImage}
            isLoading={isGenerating}
            modelName="gemini-3-pro-image-preview"
            resolution={resolution}
        />
      </main>

      <UnifiedChatBar 
        prompt={prompt}
        setPrompt={setPrompt}
        resolution={resolution}
        setResolution={setResolution}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        numVariations={numVariations}
        setNumVariations={setNumVariations}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
      />

      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onClose={() => setIsKeyModalOpen(false)} 
      />

      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#c7ff00]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
    </div>
  );
};

export default App;
