const axios = require('axios');

async function testDelete() {
  console.log('🧪 Testing project delete functionality...');
  
  try {
    // First, get all projects
    const getResponse = await axios.get('http://localhost:3002/api/projects');
    console.log('📋 Current projects:', getResponse.data.length);
    
    if (getResponse.data.length > 0) {
      const projectToDelete = getResponse.data[0];
      console.log('🗑️ Deleting project:', projectToDelete.name, '(ID:', projectToDelete.id, ')');
      
      // Delete the project
      const deleteResponse = await axios.delete(`http://localhost:3002/api/projects/${projectToDelete.id}`);
      console.log('✅ Delete response:', deleteResponse.data);
      
      // Verify deletion
      const verifyResponse = await axios.get('http://localhost:3002/api/projects');
      console.log('📋 Projects after deletion:', verifyResponse.data.length);
      
      if (verifyResponse.data.length < getResponse.data.length) {
        console.log('✅ Project delete functionality working!');
      } else {
        console.log('❌ Project delete failed - project still exists');
      }
    } else {
      console.log('ℹ️ No projects to delete');
    }
    
  } catch (error) {
    console.log('❌ Error testing delete:', error.message);
  }
}

testDelete();







