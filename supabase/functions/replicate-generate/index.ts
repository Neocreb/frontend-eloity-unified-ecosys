// Supabase Edge Function for Replicate API Integration
// This function securely handles AI content generation through Replicate API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.7.0";

console.log("🚀 Supabase Edge Function: replicate-generate started");

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { headers: { 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    // Parse the request body
    const { model, ...params } = await req.json();

    // Validate required parameters
    if (!model) {
      return new Response(
        JSON.stringify({ error: 'Missing model parameter' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Retrieve Replicate API key from environment variables
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    
    if (!replicateApiKey) {
      return new Response(
        JSON.stringify({ error: 'REPLICATE_API_KEY not configured' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    let output;
    
    // Handle different models
    switch (model) {
      case 'stable-diffusion':
        // Stable Diffusion model
        output = await replicate.run(
          "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
          {
            input: {
              prompt: params.prompt,
              negative_prompt: params.negativePrompt || "",
              width: params.width || 512,
              height: params.height || 512,
              num_outputs: params.numOutputs || 1,
              guidance_scale: params.guidanceScale || 7.5,
              num_inference_steps: params.numInferenceSteps || 50,
            }
          }
        );
        break;
        
      case 'sdxl':
        // SDXL model for higher quality images
        output = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535523258f3644519a3a1f0f",
          {
            input: {
              prompt: params.prompt,
              negative_prompt: params.negativePrompt || "",
              width: params.width || 1024,
              height: params.height || 1024,
              num_outputs: params.numOutputs || 1,
              guidance_scale: params.guidanceScale || 7.5,
              num_inference_steps: params.numInferenceSteps || 50,
            }
          }
        );
        break;
        
      case 'video':
        // Video generation model
        output = await replicate.run(
          "text-to-video-zeroscope/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
          {
            input: {
              prompt: params.prompt,
              negative_prompt: params.negativePrompt || "",
              num_frames: params.numFrames || 24,
              fps: params.fps || 8,
              guidance_scale: params.guidanceScale || 12.5,
              num_inference_steps: params.numInferenceSteps || 50,
            }
          }
        );
        break;
        
      case 'upscale':
        // Image upscaling model
        output = await replicate.run(
          "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
          {
            input: {
              image: params.imageUrl,
              scale: params.scale || 2,
            }
          }
        );
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported model: ${model}` }),
          { headers: { 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    // Return the generated output
    return new Response(
      JSON.stringify({ output }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in replicate-generate function:', error);
    
    // Return a user-friendly error message
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate content', 
        details: error.message || 'Unknown error occurred'
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});