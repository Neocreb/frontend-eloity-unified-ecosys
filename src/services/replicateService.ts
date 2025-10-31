import Replicate from "replicate";

// Initialize Replicate client
const replicate = new Replicate({
  auth: import.meta.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN,
});

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
      const input = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.width || 512,
        height: params.height || 512,
        num_outputs: params.numOutputs || 1,
        guidance_scale: params.guidanceScale || 7.5,
        num_inference_steps: params.numInferenceSteps || 50,
      };

      const output = await replicate.run(
        "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        { input }
      );

      if (Array.isArray(output)) {
        return output as string[];
      } else {
        throw new Error("Unexpected output format from Replicate API");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  },

  /**
   * Generate a video using ModelScope
   */
  async generateVideo(params: GenerateVideoParams): Promise<string> {
    try {
      const input = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        num_frames: params.numFrames || 24,
        fps: params.fps || 8,
        guidance_scale: params.guidanceScale || 12.5,
        num_inference_steps: params.numInferenceSteps || 50,
      };

      const output = await replicate.run(
        "ali-vilab/modelscope-text-to-video-synthesis:42249a90033a54798b90b6e453205b440a7a55270da952533c21d4aab021b047",
        { input }
      );

      if (typeof output === "string") {
        return output;
      } else {
        throw new Error("Unexpected output format from Replicate API");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  },

  /**
   * Generate an image using SDXL
   */
  async generateImageSDXL(params: GenerateImageParams): Promise<string[]> {
    try {
      const input = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.width || 1024,
        height: params.height || 1024,
        num_outputs: params.numOutputs || 1,
        guidance_scale: params.guidanceScale || 7.5,
        num_inference_steps: params.numInferenceSteps || 50,
      };

      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535523258f34feddc189a886",
        { input }
      );

      if (Array.isArray(output)) {
        return output as string[];
      } else {
        throw new Error("Unexpected output format from Replicate API");
      }
    } catch (error) {
      console.error("Error generating SDXL image:", error);
      throw new Error(`Failed to generate SDXL image: ${error.message}`);
    }
  },

  /**
   * Upscale an image using Real-ESRGAN
   */
  async upscaleImage(imageUrl: string, scale: number = 2): Promise<string> {
    try {
      const input = {
        image: imageUrl,
        scale,
      };

      const output = await replicate.run(
        "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        { input }
      );

      if (typeof output === "string") {
        return output;
      } else {
        throw new Error("Unexpected output format from Replicate API");
      }
    } catch (error) {
      console.error("Error upscaling image:", error);
      throw new Error(`Failed to upscale image: ${error.message}`);
    }
  }
};