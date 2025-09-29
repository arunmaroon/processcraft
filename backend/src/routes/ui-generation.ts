import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { UIVariant, DesignSystem, Persona, DesignPreferences } from '../types';

const router = express.Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// POST /api/ui-generation/variants - Generate UI variants for personas
router.post('/variants', async (req, res) => {
  try {
    const { projectId, wireframes, personas, designSystem } = req.body;

    // Generate UI variants for each persona
    const variants = await generateUIVariants(wireframes, personas, designSystem);
    
    // Save UI variants
    const variantsPath = path.join(__dirname, '../../exports/ui-variants', `${projectId}-variants.json`);
    fs.writeFileSync(variantsPath, JSON.stringify(variants, null, 2));

    res.json(variants);
  } catch (error) {
    console.error('Error generating UI variants:', error);
    res.status(500).json({ error: 'Failed to generate UI variants' });
  }
});

// POST /api/ui-generation/adapt-design-system - Adapt design system for persona
router.post('/adapt-design-system', async (req, res) => {
  try {
    const { persona, originalDesignSystem } = req.body;

    // Adapt design system for persona
    const adaptedDesignSystem = await adaptDesignSystemForPersona(persona, originalDesignSystem);
    
    res.json(adaptedDesignSystem);
  } catch (error) {
    console.error('Error adapting design system:', error);
    res.status(500).json({ error: 'Failed to adapt design system' });
  }
});

// POST /api/ui-generation/merge - Merge UI with content
router.post('/merge', async (req, res) => {
  try {
    const { projectId, uiVariant, content } = req.body;

    // Merge UI with content
    const mergedVariant = await mergeUIWithContent(uiVariant, content);
    
    // Save merged variant
    const variantPath = path.join(__dirname, '../../exports/ui-variants', `${projectId}-${uiVariant.id}-merged.json`);
    fs.writeFileSync(variantPath, JSON.stringify(mergedVariant, null, 2));

    res.json(mergedVariant);
  } catch (error) {
    console.error('Error merging UI with content:', error);
    res.status(500).json({ error: 'Failed to merge UI with content' });
  }
});

// Helper function to generate UI variants
async function generateUIVariants(wireframes: any[], personas: Persona[], designSystem: DesignSystem) {
  const variants = [];

  for (const persona of personas) {
    const prompt = `
      Generate a UI variant for the persona: ${JSON.stringify(persona, null, 2)}
      
      Wireframes: ${JSON.stringify(wireframes, null, 2)}
      Design System: ${JSON.stringify(designSystem, null, 2)}
      
      Create a UI variant that:
      1. Adapts the design system to match persona preferences
      2. Uses appropriate interaction patterns (${persona.designPreferences.interactionStyle})
      3. Adjusts complexity level (${persona.designPreferences.complexity})
      4. Implements accessibility features (${persona.designPreferences.accessibility})
      5. Uses appropriate color scheme (${persona.designPreferences.colorScheme})
      
      For each wireframe, generate:
      - A rendered UI representation
      - Interaction definitions
      - Accessibility annotations
      - Persona-specific adaptations
      
      Format as a UIVariant object with:
      - personaId
      - name
      - description
      - designSystem (adapted)
      - screens (array of UIScreen objects)
      - content (ContentData object)
      - status: 'DRAFT'
    `;

    try {
      if (!openai) throw new Error('OpenAI not available');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UI designer creating persona-specific interfaces. Generate detailed, accessible UI variants that match user preferences and needs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      });

      const content = completion.choices[0].message.content;
      const variant = JSON.parse(content || '{}');
      
      // Add required fields
      const uiVariant: UIVariant = {
        id: uuidv4(),
        personaId: persona.id,
        name: variant.name || `${persona.name} UI Variant`,
        description: variant.description || `UI variant tailored for ${persona.name}`,
        designSystem: variant.designSystem || designSystem,
        screens: variant.screens || [],
        content: variant.content || {
          copy: {},
          images: {},
          microcopy: {},
          accessibility: {
            altText: {},
            ariaLabels: {},
            focusOrder: [],
            screenReaderNotes: {}
          }
        },
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      variants.push(uiVariant);
    } catch (error) {
      console.error(`Error generating variant for persona ${persona.name}:`, error);
    }
  }

  return variants;
}

// Helper function to adapt design system for persona
async function adaptDesignSystemForPersona(persona: Persona, originalDesignSystem: DesignSystem) {
  const prompt = `
    Adapt the design system for the persona: ${JSON.stringify(persona, null, 2)}
    
    Original Design System: ${JSON.stringify(originalDesignSystem, null, 2)}
    
    Adapt the design system based on:
    1. Complexity preference: ${persona.designPreferences.complexity}
    2. Interaction style: ${persona.designPreferences.interactionStyle}
    3. Color scheme: ${persona.designPreferences.colorScheme}
    4. Accessibility level: ${persona.designPreferences.accessibility}
    
    Make the following adaptations:
    - Simplify or complexify components based on preference
    - Adjust color palette for better accessibility/readability
    - Modify typography for target audience
    - Update spacing and sizing for usability
    - Enhance accessibility features if needed
    
    Format as a DesignSystem object with adapted tokens.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert design system designer. Adapt design systems to match user preferences while maintaining consistency and accessibility.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error('Error adapting design system:', error);
    return originalDesignSystem;
  }
}

// Helper function to merge UI with content
async function mergeUIWithContent(uiVariant: UIVariant, content: any) {
  const prompt = `
    Merge the UI variant with content:
    
    UI Variant: ${JSON.stringify(uiVariant, null, 2)}
    Content: ${JSON.stringify(content, null, 2)}
    
    Merge the content into the UI by:
    1. Replacing placeholder text with actual content
    2. Adding appropriate images
    3. Updating microcopy for better UX
    4. Ensuring content fits the design
    5. Maintaining accessibility standards
    
    Return the merged UIVariant with updated content.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX writer and designer. Merge content with UI designs to create cohesive, user-friendly interfaces.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const content = completion.choices[0].message.content;
    const mergedVariant = JSON.parse(content || '{}');
    
    return {
      ...uiVariant,
      content: mergedVariant.content || uiVariant.content,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error merging UI with content:', error);
    return uiVariant;
  }
}

export default router;
