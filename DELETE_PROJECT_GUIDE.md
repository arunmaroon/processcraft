# 🗑️ How to Delete a Project

## Step-by-Step Instructions

### 1. **Navigate to Project Manager**
- Go to the main dashboard
- You'll see all your projects in a grid layout

### 2. **Find the Project to Delete**
- Look for the project you want to delete
- Each project card has a three-dots menu (⋮) in the top-right corner

### 3. **Open the Dropdown Menu**
- Click the **three dots (⋮) button** on the project card
- A dropdown menu will appear with two options:
  - ✏️ **Edit Project**
  - 🗑️ **Delete Project**

### 4. **Select Delete Project**
- Click on **"Delete Project"** from the dropdown
- A confirmation modal will appear

### 5. **Confirm Deletion**
- The modal will show:
  - ⚠️ **Warning**: "This action cannot be undone"
  - Two buttons: **Cancel** and **Delete**
- Click **"Delete"** to confirm
- Click **"Cancel"** to abort

### 6. **Verification**
- The project will be removed from the list immediately
- You'll see the updated project count
- The project is permanently deleted from the database

## Visual Guide

```
┌─────────────────────────────────────┐
│ Project Name                ⋮      │ ← Click the three dots
│ Description...                      │
│                                     │
│ [Stage Icon] Stage Name    [Status] │
│ Updated Date              v1.0      │
└─────────────────────────────────────┘
         ↓
    ┌─────────────┐
    │ Edit Project│
    │ Delete Proj │ ← Click this
    └─────────────┘
         ↓
    ┌─────────────────────┐
    │ ⚠️ Delete Project   │
    │ This action cannot  │
    │ be undone.          │
    │                     │
    │ [Cancel] [Delete]   │ ← Click Delete
    └─────────────────────┘
```

## Troubleshooting

### **Can't see the three dots menu?**
- Make sure you're hovering over the project card
- The menu appears on hover/focus
- Try clicking directly on the three dots icon

### **Delete button not working?**
- Check if the backend server is running (port 3002)
- Check browser console for errors
- Try refreshing the page

### **Project still appears after deletion?**
- The deletion might have failed
- Check the browser console for error messages
- Try refreshing the page to sync with the backend

## Technical Details

- **Backend API**: `DELETE /api/projects/:id`
- **Frontend**: Uses React state management
- **Database**: Removes from JSON file
- **Confirmation**: Required to prevent accidental deletion

---

**Note**: Project deletion is permanent and cannot be undone. Make sure you really want to delete the project before confirming.








