# Inline Editing User Guide

## Quick Start

The Contact Details page now supports inline editing for all fields. Simply **click any field to edit it**.

## Visual States

### 1. Default State (View Mode)
```
┌─────────────────────────────────┐
│ EMAIL                           │
│ john.doe@example.com            │
└─────────────────────────────────┘
```

### 2. Hover State
```
┌─────────────────────────────────┐
│ EMAIL                     [📝]  │
│ john.doe@example.com      [📋] │ ← Edit & Copy icons appear
└─────────────────────────────────┘
```

### 3. Edit Mode
```
┌─────────────────────────────────┐
│ EMAIL *                         │
│ [john.doe@example.com    ] ✓ ✗ │ ← Input field with Save/Cancel
└─────────────────────────────────┘
```

### 4. Saving State
```
┌─────────────────────────────────┐
│ EMAIL *                         │
│ [john.doe@example.com    ] ⟳ ✗ │ ← Spinner while saving
└─────────────────────────────────┘
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Click` or `Enter` | Start editing |
| `Enter` | Save changes (not in textarea) |
| `Escape` | Cancel editing |
| `Tab` | Move to next field |
| Blur (click outside) | Auto-save |

## Field Types

### Text Fields
- **First Name, Last Name, Company, Role, Territory, Commission Structure**
- Simple text input
- Click to edit, type, press Enter to save

### Email & Phone Fields
- **Email, Mobile, Phone**
- Copy button appears on hover
- Validation for email format
- Click copy icon to copy to clipboard

### Select Dropdowns
- **Type**
- Options: Broker, Disposal Agent, Tenant, Other
- Click to open dropdown
- Select option to save immediately

### Number Fields
- **Referral Volume, Conversion Rate, Revenue Attribution, Commission Paid, Quality Score**
- Numeric input only
- Formatted display (e.g., £1,234, 45%)
- Click to edit raw number

### Textarea Fields
- **Relationship Notes**
- Multi-line text input
- Press Enter for new line
- Click Save button or blur to save

## Tips

### ✅ Do's
- Click directly on the field value to edit
- Use Enter to quickly save text fields
- Use the copy button for emails and phones
- Check for the success toast after saving

### ❌ Don'ts
- Don't leave required fields empty (marked with *)
- Don't worry about clicking Save immediately - blur auto-saves
- Don't navigate away while saving (wait for the toast)

## Troubleshooting

### Field won't save
- **Check required fields**: Make sure required fields (marked with *) aren't empty
- **Network issues**: Check your internet connection
- **Validation errors**: Some fields have format requirements (e.g., email)

### Changes not appearing
- **Wait for toast**: Look for the success/error toast notification
- **Refresh if needed**: If changes don't appear, try refreshing the page
- **Check Network tab**: Look for failed API requests in browser DevTools

### Edit mode stuck open
- **Press Escape**: Cancel out of edit mode
- **Check for errors**: Look for error toast or console messages
- **Refresh page**: As last resort, refresh to reset the form

## Examples

### Editing a Contact's Email
1. Navigate to Contact Details page
2. Find the "Email" field under Contact Information
3. Hover to see the edit icon
4. Click on the email address
5. Type the new email
6. Press Enter or click the ✓ button
7. Wait for "Field updated successfully" toast

### Changing Contact Type
1. Scroll to the "Type" field
2. Click on the current type (e.g., "Broker")
3. Dropdown opens automatically
4. Select new type from the list
5. Change saves immediately
6. Toast confirms the update

### Updating Performance Metrics
1. Click on the "Performance" tab
2. Find the metric you want to update (e.g., "Referral Volume")
3. Click on the number
4. Type the new value
5. Press Enter to save
6. The formatted value updates automatically

## Advanced Features

### Copy to Clipboard
- Available for: Email, Mobile, Phone fields
- Click the 📋 icon (appears on hover)
- Toast confirms "Email copied to clipboard"

### Auto-formatting
- Currency fields: Automatically format as £1,234
- Percentage fields: Show as 45%
- Dates: Display in DD-MM-YYYY format

### Optimistic Updates
- Changes appear immediately in the UI
- If save fails, the field reverts to the old value
- Error toast explains what went wrong

## Comparison with Old Edit Page

| Feature | Old Way | New Way |
|---------|---------|---------|
| **Navigate to edit** | Click Edit button → New page | Click field directly |
| **Edit single field** | Open form, change, save all | Click field, change, save |
| **See other fields** | Hidden when editing | Always visible |
| **Cancel changes** | Back button or cancel | Escape key or ✗ button |
| **Save changes** | Save button at bottom | Enter key or ✓ button |
| **Feedback** | Page redirect | Toast notification |

## Benefits

✨ **Faster**: Edit any field in one click
🎯 **Contextual**: See all information while editing
💡 **Intuitive**: Click what you want to change
✅ **Safe**: Easy to cancel or undo
📱 **Responsive**: Works on all screen sizes
