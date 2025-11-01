import { supabase } from "@/integrations/supabase/client";

// Call Replicate through edge functions to keep API keys secure

export interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

export interface GenerateVideoParams {
  prompt: string;
  negativePrompt?: string;
  numFrames?: number;
  fps?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

export const replicateService = {
  /**
   * Generate an image using Stable Diffusion
   */
  async generateImage(params: GenerateImageParams): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('replicate-generate', {
        body: {
          prompt: params.prompt,
          model: 'stable-diffusion',
          ...params
        }
      });

      if (error) throw error;
      if (!data?.output) throw new Error("No output from generation");
      
      return Array.isArray(data.output) ? data.output : [data.output];
    } catch (error) {
      console.error("Error generating image:", error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Generate a video using ModelScope
   */
  async generateVideo(params: GenerateVideoParams): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('replicate-generate', {
        body: {
          prompt: params.prompt,
          model: 'video',
          ...params
        }
      });

      if (error) throw error;
      if (!data?.output) throw new Error("No output from generation");
      
      return typeof data.output === "string" ? data.output : data.output[0];
    } catch (error) {
      console.error("Error generating video:", error);
      throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Generate an image using SDXL
   */
  async generateImageSDXL(params: GenerateImageParams): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('replicate-generate', {
        body: {
          prompt: params.prompt,
          model: 'sdxl',
          ...params
        }
      });

      if (error) throw error;
      if (!data?.output) throw new Error("No output from generation");
      
      return Array.isArray(data.output) ? data.output : [data.output];
    } catch (error) {
      console.error("Error generating SDXL image:", error);
      throw new Error(`Failed to generate SDXL image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Upscale an image using Real-ESRGAN
   */
  async upscaleImage(imageUrl: string, scale: number = 2): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('replicate-generate', {
        body: {
          model: 'upscale',
          imageUrl,
          scale
        }
      });

      if (error) throw error;
      if (!data?.output) throw new Error("No output from upscaling");
      
      return typeof data.output === "string" ? data.output : data.output[0];
    } catch (error) {
      console.error("Error upscaling image:", error);
      throw new Error(`Failed to upscale image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};