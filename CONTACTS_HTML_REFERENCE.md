# Contacts Page HTML Reference

This document captures the exact styling from `public/Contacts List Page.html` to ensure the React version matches.

## Table Headers
The HTML has these columns (NO "Last Activity" column - it's shown under the name):
1. Checkbox
2. Name
3. Type
4. Company
5. Email
6. Phone
7. Open Items
8. Health
9. Actions

## Contact Row Structure

### Name Cell
```html
<td class="px-6 py-4">
    <div class="flex items-center space-x-3">
        <!-- Avatar: w-10 h-10, bg-[#3d3d3d] dark grey -->
        <div class="w-10 h-10 rounded-full bg-[#3d3d3d] flex items-center justify-center text-white font-semibold">
            ${initials}
        </div>
        <div>
            <!-- Name -->
            <div class="font-semibold text-primary text-sm">${safeName}</div>
            <!-- Last activity shown UNDER the name, not as separate column -->
            <div class="text-xs text-secondary">${lastActivity}</div>
        </div>
    </div>
</td>
```

### Type Badge
```html
<td class="px-6 py-4">
    <!-- rounded-full, with icon, colored background for Broker -->
    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeMeta.badgeClass}">
        <i class="fa-solid ${typeMeta.icon} mr-1.5"></i>
        ${typeLabel}
    </span>
</td>
```

Type badge classes:
- **Broker**: `bg-black text-white` with `fa-briefcase` icon
- **Disposal Agent**: `bg-secondary text-white` with `fa-building` icon
- **Tenant**: `bg-accent text-white` with `fa-user-tie` icon
- **Supplier**: `bg-muted text-primary` with `fa-wrench` icon

### Open Items Cell
```html
<td class="px-6 py-4">
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-primary">
        <i class="fa-solid fa-chart-line mr-1"></i>
        Not tracked
    </span>
</td>
```

### Health Badge
```html
<td class="px-6 py-4">
    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${healthBadge}">
        <!-- Small circle indicator -->
        <i class="fa-solid fa-circle mr-1.5 text-[6px]"></i>
        ${health}
    </span>
</td>
```

Health badge colors:
- Excellent: `bg-green-100 text-green-800`
- Good: `bg-green-100 text-green-800`
- Fair: `bg-yellow-100 text-yellow-800`
- Needs Attention: `bg-red-100 text-red-800`

## Key Differences from Current React

1. **Avatar size**: HTML uses `w-10 h-10`, React uses `w-8 h-8`
2. **Avatar background**: HTML uses `bg-[#3d3d3d]`, React uses `bg-primary`
3. **Last Activity**: HTML shows under name, React has separate column
4. **Type badge**: HTML uses `rounded-full` with colored bg, React uses `rounded-md` with border
5. **Open Items**: HTML shows "Not tracked" badge, React shows "X deals"
6. **Health badge**: HTML has circle icon indicator, React doesn't

