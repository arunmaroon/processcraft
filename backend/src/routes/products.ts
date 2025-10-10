import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

interface PRD {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  version: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  content: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  owner: string;
  prds: PRD[];
  tags: string[];
}

// Get all products
router.get('/', async (req: any, res: any) => {
  try {
    const productsPath = path.join(__dirname, '../../data/products.json');
    
    // Check if products.json exists, if not create it with sample data
    if (!fs.existsSync(productsPath)) {
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'DigiGold Investment Platform',
          description: 'Digital gold investment and trading platform',
          category: 'FinTech',
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          owner: 'Product Team',
          tags: ['investment', 'gold', 'trading'],
          prds: [
            {
              id: 'prd-1',
              title: 'User Onboarding Flow',
              description: 'Complete user onboarding experience for new investors',
              status: 'approved',
              version: '1.2',
              createdAt: '2024-01-15',
              updatedAt: '2024-01-18',
              author: 'UX Team',
              tags: ['onboarding', 'user-experience'],
              content: 'Detailed PRD content for user onboarding...'
            },
            {
              id: 'prd-2',
              title: 'Trading Interface',
              description: 'Core trading interface for buying and selling gold',
              status: 'review',
              version: '2.0',
              createdAt: '2024-01-16',
              updatedAt: '2024-01-19',
              author: 'Product Team',
              tags: ['trading', 'interface'],
              content: 'Detailed PRD content for trading interface...'
            }
          ]
        },
        {
          id: '2',
          name: 'Mobile Banking App',
          description: 'Comprehensive mobile banking application',
          category: 'Banking',
          status: 'active',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-22',
          owner: 'Banking Team',
          tags: ['banking', 'mobile', 'fintech'],
          prds: [
            {
              id: 'prd-3',
              title: 'Account Management',
              description: 'User account management and profile features',
              status: 'draft',
              version: '1.0',
              createdAt: '2024-01-10',
              updatedAt: '2024-01-12',
              author: 'Product Team',
              tags: ['account', 'profile'],
              content: 'Detailed PRD content for account management...'
            }
          ]
        }
      ];
      
      // Ensure data directory exists
      const dataDir = path.dirname(productsPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(productsPath, JSON.stringify({ products: sampleProducts }, null, 2));
    }

    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    res.json({
      success: true,
      products: data.products || []
    });
  } catch (error: any) {
    console.error('Error loading products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load products'
    });
  }
});

// Create new product
router.post('/', async (req: any, res: any) => {
  try {
    const { name, description, category, owner, tags, status = 'active' } = req.body;

    if (!name || !description || !category || !owner) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, category, and owner are required'
      });
    }

    const productsPath = path.join(__dirname, '../../data/products.json');
    const data = fs.existsSync(productsPath) 
      ? JSON.parse(fs.readFileSync(productsPath, 'utf8'))
      : { products: [] };

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name,
      description,
      category,
      status,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      owner,
      tags: Array.isArray(tags) ? tags : [],
      prds: []
    };

    data.products.push(newProduct);
    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      product: newProduct
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// Update product
router.put('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const productsPath = path.join(__dirname, '../../data/products.json');
    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    const productIndex = data.products.findIndex((p: Product) => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    data.products[productIndex] = {
      ...data.products[productIndex],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      product: data.products[productIndex]
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const productsPath = path.join(__dirname, '../../data/products.json');
    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    const productIndex = data.products.findIndex((p: Product) => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    data.products.splice(productIndex, 1);
    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// Add PRD to product
router.post('/:id/prds', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, author, tags, status = 'draft', version = '1.0' } = req.body;

    if (!title || !description || !author) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and author are required'
      });
    }

    const productsPath = path.join(__dirname, '../../data/products.json');
    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    const productIndex = data.products.findIndex((p: Product) => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const newPRD: PRD = {
      id: `prd-${Date.now()}`,
      title,
      description,
      author,
      tags: Array.isArray(tags) ? tags : [],
      status,
      version,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      content: ''
    };

    data.products[productIndex].prds.push(newPRD);
    data.products[productIndex].updatedAt = new Date().toISOString().split('T')[0];

    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      prd: newPRD,
      product: data.products[productIndex]
    });
  } catch (error: any) {
    console.error('Error creating PRD:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create PRD'
    });
  }
});

// Update PRD
router.put('/:productId/prds/:prdId', async (req: any, res: any) => {
  try {
    const { productId, prdId } = req.params;
    const updates = req.body;

    const productsPath = path.join(__dirname, '../../data/products.json');
    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    const productIndex = data.products.findIndex((p: Product) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const prdIndex = data.products[productIndex].prds.findIndex((p: PRD) => p.id === prdId);
    if (prdIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'PRD not found'
      });
    }

    data.products[productIndex].prds[prdIndex] = {
      ...data.products[productIndex].prds[prdIndex],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    data.products[productIndex].updatedAt = new Date().toISOString().split('T')[0];

    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      prd: data.products[productIndex].prds[prdIndex]
    });
  } catch (error: any) {
    console.error('Error updating PRD:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update PRD'
    });
  }
});

// Delete PRD
router.delete('/:productId/prds/:prdId', async (req: any, res: any) => {
  try {
    const { productId, prdId } = req.params;

    const productsPath = path.join(__dirname, '../../data/products.json');
    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    const productIndex = data.products.findIndex((p: Product) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const prdIndex = data.products[productIndex].prds.findIndex((p: PRD) => p.id === prdId);
    if (prdIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'PRD not found'
      });
    }

    data.products[productIndex].prds.splice(prdIndex, 1);
    data.products[productIndex].updatedAt = new Date().toISOString().split('T')[0];

    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'PRD deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting PRD:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete PRD'
    });
  }
});

export default router;



