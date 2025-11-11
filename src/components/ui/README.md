# UI Components Library

This directory contains all shared UI components for the UNION Spaces Core application. All components follow the design system and are fully typed with TypeScript.

## Core Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" icon="fa-plus" onClick={handleClick}>
  Add Item
</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `destructive`
**Sizes:** `sm`, `md`, `lg`
**Props:** `icon`, `iconPosition`, `isLoading`, `disabled`

### Input
Form input with label, error handling, and icon support.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  icon="fa-envelope"
  error={errors.email}
  required
/>
```

### Select
Dropdown select with label and error handling.

```tsx
import { Select } from '@/components/ui';

<Select
  label="Category"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  placeholder="Select an option"
/>
```

### Textarea
Multi-line text input.

```tsx
import { Textarea } from '@/components/ui';

<Textarea
  label="Description"
  rows={4}
  placeholder="Enter description..."
/>
```

### Badge
Status badge with multiple variants.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary" size="md">Active</Badge>
```

**Variants:** `default`, `primary`, `secondary`, `success`, `warning`, `destructive`, `outline`

### Chip
Similar to Badge, with different styling options.

```tsx
import { Chip } from '@/components/ui';

<Chip variant="primary">Category</Chip>
```

## Layout Components

### Card
Container component with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Tabs
Tab navigation component.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

<Tabs defaultTab="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

## Overlay Components

### Modal
Modal dialog component.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  title="Modal Title"
  onClose={handleClose}
  footer={<Button onClick={handleSave}>Save</Button>}
>
  Modal content
</Modal>
```

### ConfirmModal
Pre-built confirmation modal.

```tsx
import { ConfirmModal } from '@/components/ui';

<ConfirmModal
  isOpen={isOpen}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  variant="destructive"
/>
```

### SlideOver
Slide-over drawer panel.

```tsx
import { SlideOver } from '@/components/ui';

<SlideOver
  isOpen={isOpen}
  title="Edit Item"
  onClose={handleClose}
  size="lg"
  footer={<Button onClick={handleSave}>Save</Button>}
>
  Form content
</SlideOver>
```

### ConfirmDialog
Confirmation dialog (alternative to ConfirmModal).

```tsx
import { ConfirmDialog } from '@/components/ui';

<ConfirmDialog
  isOpen={isOpen}
  title="Confirm Action"
  message="Are you sure?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

## Data Display

### Table
Complete table component with header, body, and cells.

```tsx
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui';

<Table>
  <TableHeader>
    <TableHeaderCell>Name</TableHeaderCell>
    <TableHeaderCell align="right">Actions</TableHeaderCell>
  </TableHeader>
  <TableBody>
    <TableRow onClick={handleRowClick}>
      <TableCell>Item 1</TableCell>
      <TableCell align="right">
        <Button size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### EmptyState
Empty state display for lists.

```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  title="No items found"
  description="Get started by creating a new item"
  icon="fa-inbox"
  action={{
    label: 'Create Item',
    onClick: handleCreate
  }}
/>
```

### LoadingSpinner
Loading indicator.

```tsx
import { LoadingSpinner, LoadingOverlay } from '@/components/ui';

<LoadingSpinner size="lg" text="Loading..." />

// Or as overlay
<LoadingOverlay isLoading={isLoading} text="Loading data...">
  <YourContent />
</LoadingOverlay>
```

## Form Components

### SearchInput
Search input with debouncing.

```tsx
import { SearchInput } from '@/components/ui';

<SearchInput
  placeholder="Search..."
  onSearch={(value) => handleSearch(value)}
  debounceMs={300}
/>
```

### FilterSection
Filter section container.

```tsx
import { FilterSection, FilterGroup } from '@/components/ui';

<FilterSection onClear={handleClearFilters}>
  <FilterGroup>
    <Select options={categoryOptions} />
    <Select options={statusOptions} />
  </FilterGroup>
</FilterSection>
```

## Design System

All components use the design system tokens defined in `src/index.css`:

- **Colors:** `primary`, `secondary`, `destructive`, `muted`, `accent`
- **Spacing:** Consistent padding and margins
- **Typography:** Inter font family
- **Borders:** `#E6E6E6` with `10px` border radius
- **Shadows:** Subtle shadows for elevation

## Usage

Import components from the index file:

```tsx
import { Button, Input, Card, Modal } from '@/components/ui';
```

Or import individually:

```tsx
import { Button } from '@/components/ui/Button';
```

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader support

